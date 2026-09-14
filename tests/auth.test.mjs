import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['src/auth.ts'], bundle: true, write: false, format: 'esm',
  plugins: [{ name: 'mock-auth', setup(build) {
    build.onResolve({ filter: /^\.\/supabase$/ }, () => ({ path: 'auth-mock', namespace: 'test' }));
    build.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents:
      'export const supabase = { auth: { mfa: { getAuthenticatorAssuranceLevel: (...args) => globalThis.authCheck(...args) } } };', loader: 'js' }));
  } }],
});
const { getMfaStatus, rememberPasswordRecovery, isPasswordRecoverySession, clearPasswordRecovery } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

test('MFA gate uses the explicit session token and fails closed', async () => {
  const session = { access_token: 'test-token', user: { factors: [] } };
  for (const [currentLevel, nextLevel, required] of [
    ['aal1', 'aal2', true], ['aal2', 'aal2', false], ['aal1', 'aal1', false],
  ]) {
    globalThis.authCheck = async (token) => {
      assert.equal(token, session.access_token);
      return { data: { currentLevel, nextLevel }, error: null };
    };
    assert.deepEqual(await getMfaStatus(session), { required });
  }
  globalThis.authCheck = async () => ({ data: null, error: new Error('Auth unavailable') });
  await assert.rejects(getMfaStatus(session), /Auth unavailable/);
  globalThis.authCheck = async () => ({ data: { currentLevel: null, nextLevel: null }, error: null });
  await assert.rejects(getMfaStatus(session), /Unable to verify/);
  delete globalThis.authCheck;
});

test('password recovery marker is limited to the matching user and can be cleared', () => {
  const values = new Map();
  globalThis.sessionStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const recoverySession = { user: { id: 'recovery-user' } };
  rememberPasswordRecovery(recoverySession);
  assert.equal(isPasswordRecoverySession(recoverySession), true);
  assert.equal(isPasswordRecoverySession({ user: { id: 'other-user' } }), false);
  clearPasswordRecovery();
  assert.equal(isPasswordRecoverySession(recoverySession), false);
  delete globalThis.sessionStorage;
});

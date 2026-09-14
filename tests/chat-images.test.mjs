import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['src/chatImages.ts'], bundle: true, write: false, format: 'esm',
  plugins: [{ name: 'mock-storage', setup(build) {
    build.onResolve({ filter: /^\.\/supabase$/ }, () => ({ path: 'storage-mock', namespace: 'test' }));
    build.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents:
      'export const supabase = { storage: { from: (...args) => globalThis.chatStorage(...args) } };', loader: 'js' }));
  } }],
});
const { uploadChatImage } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

test('chat image upload returns a durable URL only after storage succeeds', async () => {
  const file = new File(['test image'], 'photo.png', { type: 'image/png' });
  const paths = [];
  let uploaded = false;
  globalThis.chatStorage = (name) => {
    assert.equal(name, 'campus-images');
    return {
      async upload(path, actualFile, options) {
        assert.equal(actualFile, file);
        assert.deepEqual(options, { contentType: 'image/png', upsert: false });
        assert.match(path, /^products\/chat_student_[\da-f-]+\.png$/);
        paths.push(path);
        uploaded = true;
        return { error: null };
      },
      getPublicUrl(path) {
        assert.equal(uploaded, true);
        return { data: { publicUrl: `https://storage.example/${path}` } };
      },
    };
  };
  assert.match(await uploadChatImage(file, 'student'), /^https:\/\//);
  await uploadChatImage(file, 'student');
  assert.notEqual(paths[0], paths[1]);
});

test('failed uploads do not produce an attachment URL', async () => {
  globalThis.chatStorage = () => ({
    upload: async () => ({ error: { message: 'Permission denied' } }),
    getPublicUrl: () => assert.fail('Must not save a URL for a failed upload'),
  });
  await assert.rejects(uploadChatImage(new File(['x'], 'image.jpg', { type: 'image/jpeg' }), 'student'), /Permission denied/);
});

test('invalid or oversized files and missing users do not reach storage', async () => {
  globalThis.chatStorage = () => assert.fail('Invalid attachment reached storage');
  await assert.rejects(uploadChatImage({ type: 'application/pdf', size: 1 }, 'student'), /JPG/);
  await assert.rejects(uploadChatImage({ type: 'image/png', size: 10 * 1024 * 1024 + 1 }, 'student'), /10 MB/);
  await assert.rejects(uploadChatImage({ type: 'image/png', size: 1 }, ''), /log in/);
});

import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const PASSWORD_RECOVERY_KEY = "campustrade-password-recovery";
const PASSWORD_RECOVERY_MAX_AGE_MS = 60 * 60 * 1000;

// Passing the token makes Supabase fetch current factors from Auth instead of
// relying on the potentially stale factors cached in session.user.
export async function getMfaStatus(session: Session) {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(session.access_token);
  if (error) throw error;
  if (!data?.currentLevel) throw new Error("Unable to verify your session. Please log in again.");
  return { required: data.nextLevel === "aal2" && data.currentLevel !== "aal2" };
}

export function rememberPasswordRecovery(session: Session) {
  sessionStorage.setItem(PASSWORD_RECOVERY_KEY, JSON.stringify({
    userId: session.user.id,
    startedAt: Date.now(),
  }));
}

export function isPasswordRecoverySession(session: Session) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PASSWORD_RECOVERY_KEY) || "null");
    return saved?.userId === session.user.id &&
      Number.isFinite(saved?.startedAt) &&
      Date.now() - saved.startedAt < PASSWORD_RECOVERY_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function clearPasswordRecovery() {
  sessionStorage.removeItem(PASSWORD_RECOVERY_KEY);
}

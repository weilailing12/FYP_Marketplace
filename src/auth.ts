import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Passing the token makes Supabase fetch current factors from Auth instead of
// relying on the potentially stale factors cached in session.user.
export async function getMfaStatus(session: Session) {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(session.access_token);
  if (error) throw error;
  if (!data?.currentLevel) throw new Error("Unable to verify your session. Please log in again.");
  return { required: data.nextLevel === "aal2" && data.currentLevel !== "aal2" };
}

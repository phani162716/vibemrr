"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGithub(next = "/dashboard") {
  const supabase = createClient();
  const origin = window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) throw error;
}

export async function signInWithMagicLink(email: string, next = "/dashboard") {
  const supabase = createClient();
  const origin = window.location.origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) throw error;
}

export async function signUpWithPassword(email: string, password: string, name?: string, whatsapp?: string) {
  const supabase = createClient();
  const origin = window.location.origin;
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error("Enter a WhatsApp number with country code, e.g. 91XXXXXXXXXX.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: { full_name: name || email.split("@")[0], whatsapp: digits },
    },
  });
  if (error) throw error;
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    throw new Error("This email is already registered. Sign in, or use Forgot password.");
  }
  if (data.user && !data.session) {
    throw new Error(
      "Account created, but email confirmation is on. Check your inbox, or use Forgot password to set a new password and get in."
    );
  }
  if (data.user) {
    await supabase.rpc("save_my_profile", {
      p_name: name || email.split("@")[0],
      p_whatsapp: digits,
      p_handle: null,
      p_bio: null,
      p_role: null,
    });
  }
  return digits;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login") || msg.includes("invalid_credentials")) {
      throw new Error(
        "Invalid login. Wrong password, or this email was never confirmed. Use Forgot password — that email will let you set a new password and sign in."
      );
    }
    if (msg.includes("email not confirmed")) {
      throw new Error("Confirm your email first, or use Forgot password to recover the account.");
    }
    throw error;
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  const origin = window.location.origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

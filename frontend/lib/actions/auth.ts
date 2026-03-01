"use server";

import { redirect } from "next/navigation";
import { signIn, signUp, confirmSignUp } from "@/lib/cognito";
import { setSession, clearSession } from "@/lib/session";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthState {
  error?: string;
  success?: boolean;
  email?: string;
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const tokens = await signIn(email, password);
    await setSession(tokens);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sign in failed.";
    return { error: message };
  }

  redirect("/dashboard");
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signUp(email, password);
    return { success: true, email };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sign up failed.";
    return { error: message };
  }
}

// ─── Confirm Sign Up ─────────────────────────────────────────────────────────

export async function confirmSignUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  if (!email || !code) {
    return { error: "Email and confirmation code are required." };
  }

  try {
    await confirmSignUp(email, code);
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Confirmation failed.";
    return { error: message };
  }
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export async function signOutAction() {
  await clearSession();
  redirect("/");
}

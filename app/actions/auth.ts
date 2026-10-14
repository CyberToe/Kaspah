"use server";

import { redirect } from "next/navigation";
import {
  changePassword,
  createAccount,
  findResetToken,
  findUserByEmail,
  findUserById,
  markLogin,
  markResetUsed,
  removeUser,
  saveResetToken,
} from "@/lib/data";
import { passwordError, safeNext, type FormState, normalizeEmail } from "@/lib/forms";
import { appUrl, sendPasswordReset } from "@/lib/mail";
import {
  checkPassword,
  clearSession,
  getCurrentUser,
  hashPassword,
  hashSecret,
  newSecret,
  setSession,
} from "@/lib/session";

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = formData.get("password");
  const confirm = formData.get("confirm");
  if (!email) return { error: "Enter a valid email address." };
  const problem = passwordError(password);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "Those passwords do not match." };
  if (await findUserByEmail(email)) return { error: "An account with that email already exists. Try logging in." };
  const id = crypto.randomUUID();
  await createAccount({ id, email, passwordHash: await hashPassword(String(password)) });
  await setSession(id, 1);
  redirect("/onboarding/details");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const user = email ? await findUserByEmail(email) : null;
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }
  await markLogin(user.id);
  await setSession(user.id, user.tokenVersion);
  redirect(safeNext(formData.get("next")) ?? "/readings");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

export async function requestReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(formData.get("email"));
  const message = "If an account exists for that email, a reset link is on its way.";
  if (!email) return { message };
  const user = await findUserByEmail(email);
  if (!user) return { message };
  const { token, hash } = newSecret();
  await saveResetToken({
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  const link = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const sent = await sendPasswordReset(email, link);
  if (!sent.delivered && process.env.NODE_ENV !== "production") {
    return { message, devLink: link };
  }
  return { message };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = formData.get("password");
  const confirm = formData.get("confirm");
  const problem = passwordError(password);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "Those passwords do not match." };
  const row = await findResetToken(hashSecret(token));
  if (!row || row.usedAt || new Date(row.expiresAt).getTime() < Date.now()) {
    return { error: "This reset link is invalid or has expired." };
  }
  const account = await findUserById(row.userId);
  if (!account) return { error: "This reset link is invalid or has expired." };
  await changePassword(account.id, await hashPassword(String(password)), account.tokenVersion + 1);
  await markResetUsed(row.id);
  redirect("/login?reset=1");
}

export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (String(formData.get("phrase") ?? "") !== "DELETE") {
    return { error: "Type DELETE in the confirmation box." };
  }
  if (!(await checkPassword(String(formData.get("password") ?? ""), user.passwordHash))) {
    return { error: "Password does not match." };
  }
  await removeUser(user.id);
  await clearSession();
  redirect("/");
}

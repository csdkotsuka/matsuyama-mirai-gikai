import "client-only";
import { getFirebaseClient } from "@mirai-gikai/firebase/client";
import {
  type UserCredential,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";

export async function signIn(email: string, password: string) {
  const { auth } = getFirebaseClient();

  let userCredential: UserCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    console.error("Firebase sign in error:", error);
    throw new Error(
      "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
    );
  }

  const idToken = await userCredential.user.getIdToken();

  // Exchange ID token for session cookie via API
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    await fbSignOut(auth);
    throw new Error(
      errorData.error || "管理者権限がありません。アクセスが拒否されました。"
    );
  }

  return userCredential.user;
}

export async function signOut() {
  const { auth } = getFirebaseClient();
  try {
    await fbSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("ログアウトに失敗しました。");
  }
}

export async function getCurrentUser() {
  const { auth } = getFirebaseClient();
  return auth.currentUser;
}

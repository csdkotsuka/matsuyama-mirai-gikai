import { cookies } from "next/headers";
import { getAdminAuth } from "@mirai-gikai/firebase";
import { checkAdminPermission, type AdminUser } from "@/lib/auth/permissions";

/**
 * 現在のユーザーが管理者権限を持っているかチェックする
 * @returns 管理者の場合はAdminUser、そうでない場合はnull
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

    const user: AdminUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: decodedToken.admin === true,
      roles: Array.isArray(decodedToken.roles) ? decodedToken.roles : [],
    };

    if (!checkAdminPermission(user)) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * 現在のユーザーが管理者としてログインしているかチェックする
 * 管理者でない場合はエラーを投げる
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("管理者権限が必要です");
  }

  return admin;
}

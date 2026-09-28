import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";

export type AuthenticatedUserResult =
  | {
      authenticated: true;
      userId: string;
    }
  | {
      authenticated: false;
      error: string;
    };

/**
 * 認証済みユーザーを取得する共通ユーティリティ
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUserResult> {
  const {
    data: { user },
  } = await getChatSupabaseUser();

  if (!user || !user.id) {
    return { authenticated: false, error: "認証が必要です" };
  }

  return { authenticated: true, userId: user.id };
}

export type VerifySessionOwnershipResult =
  | {
      authorized: true;
      userId: string;
    }
  | {
      authorized: false;
      error: string;
    };

/**
 * セッションの所有者確認を行う共通ユーティリティ
 */
export async function verifySessionOwnership(
  sessionId: string
): Promise<VerifySessionOwnershipResult> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.authenticated) {
    return { authorized: false, error: authResult.error };
  }

  const { userId } = authResult;
  const db = getAdminFirestore();

  const doc = await db.collection("interview_sessions").doc(sessionId).get();

  if (!doc.exists) {
    return { authorized: false, error: "セッションが見つかりません" };
  }

  const session = doc.data()!;
  const sessionUserId = session.user_id || session.user_identifier;

  if (sessionUserId && sessionUserId !== userId) {
    return {
      authorized: false,
      error: "このセッションへのアクセス権限がありません",
    };
  }

  return { authorized: true, userId };
}

export function isSessionOwner(
  sessionUserId: string,
  currentUserId: string
): boolean {
  return sessionUserId === currentUserId;
}

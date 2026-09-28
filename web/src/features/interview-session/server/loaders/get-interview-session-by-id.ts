import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { InterviewSession } from "../../shared/types";
import {
  getAuthenticatedUser,
  isSessionOwner,
} from "../utils/verify-session-ownership";

export type InterviewSessionWithBillId = InterviewSession & {
  bill_id: string;
};

/**
 * セッションIDからインタビューセッション詳細を取得（完了済みセッション含む）
 * 認可チェック: セッションの所有者のみがセッション情報を取得できる
 */
export async function getInterviewSessionById(
  sessionId: string
): Promise<InterviewSessionWithBillId | null> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.authenticated) {
    console.error("Failed to get user:", authResult.error);
    return null;
  }

  const { userId } = authResult;

  try {
    const db = getAdminFirestore();
    const sessionDoc = await db
      .collection("interview_sessions")
      .doc(sessionId)
      .get();

    if (!sessionDoc.exists) {
      console.error("Interview session not found:", sessionId);
      return null;
    }

    const sessionData = sessionDoc.data() as any;

    // 認可チェック: セッションの所有者と現在のユーザーが一致するか
    if (!isSessionOwner(sessionData.user_id, userId)) {
      console.error("Unauthorized access to interview session");
      return null;
    }

    const configDoc = await db
      .collection("interview_configs")
      .doc(sessionData.interview_config_id)
      .get();

    if (!configDoc.exists) {
      console.error("Interview config not found for session");
      return null;
    }

    const configData = configDoc.data() as any;

    return {
      id: sessionDoc.id,
      ...sessionData,
      bill_id: configData.bill_id,
    };
  } catch (error) {
    console.error("Failed to fetch interview session:", error);
    return null;
  }
}

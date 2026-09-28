import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import {
  getAuthenticatedUser,
  isSessionOwner,
} from "@/features/interview-session/server/utils/verify-session-ownership";
import type { InterviewReport } from "../../shared/types";

export type InterviewReportWithSessionInfo = InterviewReport & {
  bill_id: string;
  session_started_at: string;
  session_completed_at: string | null;
  is_public_by_user: boolean;
};

/**
 * レポートIDからインタビューレポートと関連情報を取得
 */
export async function getInterviewReportById(
  reportId: string
): Promise<InterviewReportWithSessionInfo | null> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.authenticated) {
    console.error("Failed to get user:", authResult.error);
    return null;
  }

  const { userId } = authResult;
  try {
    const db = getAdminFirestore();

    const reportDoc = await db
      .collection("interview_reports")
      .doc(reportId)
      .get();
    if (!reportDoc.exists) {
      return null;
    }

    const reportData = reportDoc.data()!;
    const sessionId = reportData.session_id || reportData.interview_session_id;

    const sessionDoc = await db
      .collection("interview_sessions")
      .doc(sessionId)
      .get();
    if (!sessionDoc.exists) {
      return null;
    }

    const session = sessionDoc.data()!;
    const sessionUserId = session.user_id || session.user_identifier;

    if (sessionUserId && !isSessionOwner(sessionUserId, userId)) {
      console.error("Unauthorized access to interview report");
      return null;
    }

    return {
      id: reportDoc.id,
      ...reportData,
      bill_id: session.bill_id,
      session_started_at: session.started_at || session.created_at || "",
      session_completed_at: session.completed_at ?? null,
      is_public_by_user: session.is_public_by_user ?? false,
    } as InterviewReportWithSessionInfo;
  } catch (error) {
    console.error("Failed to fetch interview report by id:", error);
    return null;
  }
}

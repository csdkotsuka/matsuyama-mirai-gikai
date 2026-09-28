import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { verifySessionOwnership } from "@/features/interview-session/server/utils/verify-session-ownership";
import type { InterviewReport } from "../../shared/types";

/**
 * セッションIDからインタビューレポートを取得
 */
export async function getInterviewReport(
  sessionId: string
): Promise<InterviewReport | null> {
  const ownershipResult = await verifySessionOwnership(sessionId);

  if (!ownershipResult.authorized) {
    console.error(
      "Unauthorized access to interview report:",
      ownershipResult.error
    );
    return null;
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("interview_reports")
      .where("session_id", "==", sessionId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as InterviewReport;
  } catch (reportError) {
    console.error("Failed to fetch interview report:", reportError);
    return null;
  }
}

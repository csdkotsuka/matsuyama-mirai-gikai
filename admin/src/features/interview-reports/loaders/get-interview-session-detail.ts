import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { InterviewSessionDetail } from "../types";

export async function getInterviewSessionDetail(
  sessionId: string
): Promise<InterviewSessionDetail | null> {
  try {
    const db = getAdminFirestore();

    const sessionDoc = await db
      .collection("interview_sessions")
      .doc(sessionId)
      .get();
    if (!sessionDoc.exists) {
      return null;
    }

    const sessionData = sessionDoc.data()!;

    // レポートを取得
    const reportSnap = await db
      .collection("interview_reports")
      .where("session_id", "==", sessionId)
      .limit(1)
      .get();

    const report = !reportSnap.empty
      ? ({ id: reportSnap.docs[0].id, ...reportSnap.docs[0].data() } as any)
      : null;

    // メッセージを取得
    const messagesSnap = await db
      .collection("interview_messages")
      .where("session_id", "==", sessionId)
      .orderBy("created_at", "asc")
      .get();

    const messages = messagesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    return {
      id: sessionDoc.id,
      bill_id: sessionData.bill_id,
      user_identifier: sessionData.user_identifier,
      started_at:
        sessionData.started_at ||
        sessionData.created_at ||
        new Date().toISOString(),
      completed_at: sessionData.completed_at ?? null,
      archived_at: sessionData.archived_at ?? null,
      is_public_by_user: sessionData.is_public_by_user ?? false,
      created_at: sessionData.created_at || new Date().toISOString(),
      updated_at: sessionData.updated_at || new Date().toISOString(),
      interview_report: report,
      interview_messages: messages,
    };
  } catch (error) {
    console.error("Failed to fetch interview session detail:", error);
    return null;
  }
}

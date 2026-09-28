import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { InterviewSessionWithDetails } from "../types";

export const SESSIONS_PER_PAGE = 30;

export async function getInterviewSessions(
  billId: string,
  page = 1
): Promise<InterviewSessionWithDetails[]> {
  try {
    const db = getAdminFirestore();

    const sessionsSnap = await db
      .collection("interview_sessions")
      .where("bill_id", "==", billId)
      .orderBy("created_at", "desc")
      .limit(SESSIONS_PER_PAGE * page)
      .get();

    if (sessionsSnap.empty) {
      return [];
    }

    const sessions = sessionsSnap.docs
      .slice((page - 1) * SESSIONS_PER_PAGE, page * SESSIONS_PER_PAGE)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

    // 各セッションの report と message_count を取得
    const results: InterviewSessionWithDetails[] = await Promise.all(
      sessions.map(async (session) => {
        const [reportSnap, messagesSnap] = await Promise.all([
          db
            .collection("interview_reports")
            .where("session_id", "==", session.id)
            .limit(1)
            .get(),
          db
            .collection("interview_messages")
            .where("session_id", "==", session.id)
            .get(),
        ]);

        const report = !reportSnap.empty
          ? ({ id: reportSnap.docs[0].id, ...reportSnap.docs[0].data() } as any)
          : null;

        return {
          id: session.id,
          bill_id: session.bill_id,
          user_identifier: session.user_identifier,
          started_at:
            session.started_at ||
            session.created_at ||
            new Date().toISOString(),
          completed_at: session.completed_at ?? null,
          archived_at: session.archived_at ?? null,
          is_public_by_user: session.is_public_by_user ?? false,
          created_at: session.created_at || new Date().toISOString(),
          updated_at: session.updated_at || new Date().toISOString(),
          message_count: messagesSnap.size,
          interview_report: report,
        };
      })
    );

    return results;
  } catch (error) {
    console.error("Failed to fetch interview sessions:", error);
    return [];
  }
}

export async function getInterviewSessionsCount(
  billId: string
): Promise<number> {
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection("interview_sessions")
      .where("bill_id", "==", billId)
      .count()
      .get();

    return snap.data().count;
  } catch (error) {
    console.error("Failed to fetch session count:", error);
    return 0;
  }
}

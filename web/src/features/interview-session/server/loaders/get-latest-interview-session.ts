import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";

export type InterviewSessionStatus = "active" | "completed" | "none";

export interface LatestInterviewSession {
  id: string;
  status: InterviewSessionStatus;
  reportId: string | null;
}

/**
 * 最新のインタビューセッション情報を取得
 * - 進行中（active）: completed_at = null, archived_at = null
 * - 完了（completed）: completed_at != null, archived_at = null
 * - なし（none）: セッションがない、またはすべてアーカイブ済み
 */
export async function getLatestInterviewSession(
  interviewConfigId: string
): Promise<LatestInterviewSession | null> {
  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    return null;
  }

  try {
    const db = getAdminFirestore();

    const snapshot = await db
      .collection("interview_sessions")
      .where("interview_config_id", "==", interviewConfigId)
      .where("user_id", "==", user.id)
      .get();

    const activeOrCompleted = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((s: any) => !s.archived_at) as any[];

    if (activeOrCompleted.length === 0) {
      return null;
    }

    activeOrCompleted.sort((a, b) =>
      (b.created_at || "").localeCompare(a.created_at || "")
    );

    const latest = activeOrCompleted[0];
    const isCompleted = Boolean(latest.completed_at);

    let reportId: string | null = null;
    if (isCompleted) {
      const reportSnap = await db
        .collection("interview_reports")
        .where("interview_session_id", "==", latest.id)
        .limit(1)
        .get();
      if (!reportSnap.empty) {
        reportId = reportSnap.docs[0].id;
      }
    }

    return {
      id: latest.id,
      status: isCompleted ? "completed" : "active",
      reportId,
    };
  } catch (error) {
    console.error("Failed to fetch latest interview session:", error);
    return null;
  }
}

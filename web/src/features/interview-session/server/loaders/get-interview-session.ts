import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import type { InterviewSession } from "../../shared/types";

export async function getInterviewSession(
  interviewConfigId: string
): Promise<InterviewSession | null> {
  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    console.error("Failed to get user:", getUserError);
    return null;
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("interview_sessions")
      .where("interview_config_id", "==", interviewConfigId)
      .where("user_id", "==", user.id)
      .get();

    const activeSessions = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (s: any) => !s.completed_at && !s.archived_at
      ) as InterviewSession[];

    activeSessions.sort((a, b) =>
      (b.created_at || "").localeCompare(a.created_at || "")
    );

    return activeSessions[0] || null;
  } catch (error) {
    console.error("Failed to fetch interview session:", error);
    return null;
  }
}

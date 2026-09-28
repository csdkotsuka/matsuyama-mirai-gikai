"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import type { InterviewSession } from "../../shared/types";

export async function createInterviewSession({
  interviewConfigId,
}: {
  interviewConfigId: string;
}): Promise<InterviewSession> {
  const {
    data: { user },
  } = await getChatSupabaseUser();

  if (!user) {
    throw new Error("User not found");
  }

  const db = getAdminFirestore();

  // interview_config から bill_id を取得
  const configDoc = await db
    .collection("interview_configs")
    .doc(interviewConfigId)
    .get();
  const billId = configDoc.exists ? configDoc.data()?.bill_id : "";

  const docRef = db.collection("interview_sessions").doc();
  const now = new Date().toISOString();

  const sessionData = {
    id: docRef.id,
    interview_config_id: interviewConfigId,
    bill_id: billId,
    user_id: user.id,
    user_identifier: user.id,
    started_at: now,
    created_at: now,
    updated_at: now,
    completed_at: null,
    archived_at: null,
    is_public_by_user: false,
  };

  await docRef.set(sessionData);

  return sessionData as InterviewSession;
}

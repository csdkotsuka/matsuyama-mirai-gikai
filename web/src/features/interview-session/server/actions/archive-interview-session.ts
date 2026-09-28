"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { verifySessionOwnership } from "../utils/verify-session-ownership";

interface ArchiveInterviewSessionResult {
  success: boolean;
  error?: string;
}

/**
 * インタビューセッションをアーカイブする
 */
export async function archiveInterviewSession(
  sessionId: string
): Promise<ArchiveInterviewSessionResult> {
  const ownershipResult = await verifySessionOwnership(sessionId);

  if (!ownershipResult.authorized) {
    return { success: false, error: ownershipResult.error };
  }

  try {
    const db = getAdminFirestore();
    await db.collection("interview_sessions").doc(sessionId).update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (updateError) {
    console.error("Failed to archive interview session:", updateError);
    return { success: false, error: "アーカイブに失敗しました" };
  }
}

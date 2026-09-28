"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { verifySessionOwnership } from "@/features/interview-session/server/utils/verify-session-ownership";

interface UpdatePublicSettingResult {
  success: boolean;
  error?: string;
}

/**
 * インタビューセッションの公開設定を更新する
 */
export async function updatePublicSetting(
  sessionId: string,
  isPublic: boolean
): Promise<UpdatePublicSettingResult> {
  const ownershipResult = await verifySessionOwnership(sessionId);

  if (!ownershipResult.authorized) {
    return { success: false, error: ownershipResult.error };
  }

  try {
    const db = getAdminFirestore();
    await db.collection("interview_sessions").doc(sessionId).update({
      is_public_by_user: isPublic,
      updated_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (updateError) {
    console.error("Failed to update public setting:", updateError);
    return { success: false, error: "公開設定の更新に失敗しました" };
  }
}

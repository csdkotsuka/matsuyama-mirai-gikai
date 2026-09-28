"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { StanceInput } from "../types";

export async function updateStance(stanceId: string, data: StanceInput) {
  try {
    const db = getAdminFirestore();

    await db
      .collection("mirai_stances")
      .doc(stanceId)
      .update({
        type: data.type,
        comment: data.comment || null,
        updated_at: new Date().toISOString(),
      });

    invalidateWebCache();
    return { success: true };
  } catch (error) {
    console.error("Error in updateStance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
    };
  }
}

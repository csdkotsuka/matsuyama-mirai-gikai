"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";

export async function deleteStance(stanceId: string) {
  try {
    const db = getAdminFirestore();
    await db.collection("mirai_stances").doc(stanceId).delete();

    invalidateWebCache();
    return { success: true };
  } catch (error) {
    console.error("Error in deleteStance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
    };
  }
}

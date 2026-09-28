"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { StanceInput } from "../types";

export async function createStance(billId: string, data: StanceInput) {
  try {
    const db = getAdminFirestore();
    const docRef = db.collection("mirai_stances").doc();
    const now = new Date().toISOString();

    await docRef.set({
      id: docRef.id,
      bill_id: billId,
      type: data.type,
      comment: data.comment || null,
      created_at: now,
      updated_at: now,
    });

    invalidateWebCache();
    return { success: true };
  } catch (error) {
    console.error("Error in createStance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "予期しないエラーが発生しました",
    };
  }
}

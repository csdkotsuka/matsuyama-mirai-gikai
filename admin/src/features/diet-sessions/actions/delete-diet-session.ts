"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { DeleteDietSessionInput } from "../types";

export async function deleteDietSession(input: DeleteDietSessionInput) {
  try {
    await requireAdmin();

    const db = getAdminFirestore();
    const docRef = db.collection("diet_sessions").doc(input.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { error: "国会会期が見つかりません" };
    }

    await docRef.delete();

    await invalidateWebCache();
    return { success: true };
  } catch (error) {
    console.error("Delete diet session error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "国会会期の削除中にエラーが発生しました" };
  }
}

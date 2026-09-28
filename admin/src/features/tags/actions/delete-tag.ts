"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { DeleteTagInput } from "../types";

export async function deleteTag(input: DeleteTagInput) {
  try {
    await requireAdmin();

    const db = getAdminFirestore();

    const docRef = db.collection("tags").doc(input.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { error: "タグが見つかりません" };
    }

    // タグを削除
    await docRef.delete();

    // 議案の tag_ids 配列からも該当タグを除去
    const billsWithTag = await db
      .collection("bills")
      .where("tag_ids", "array-contains", input.id)
      .get();

    if (!billsWithTag.empty) {
      const batch = db.batch();
      for (const billDoc of billsWithTag.docs) {
        const currentTagIds: string[] = billDoc.data().tag_ids || [];
        batch.update(billDoc.ref, {
          tag_ids: currentTagIds.filter((id) => id !== input.id),
        });
      }
      await batch.commit();
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true };
  } catch (error) {
    console.error("Delete tag error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "タグの削除中にエラーが発生しました" };
  }
}

"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";

/**
 * 議案のタグを更新する
 */
export async function updateBillTags(billId: string, tagIds: string[]) {
  await requireAdmin();

  try {
    const db = getAdminFirestore();

    // bills ドキュメントの tag_ids を更新
    await db.collection("bills").doc(billId).update({
      tag_ids: tagIds,
      updated_at: new Date().toISOString(),
    });

    // キャッシュを更新
    await invalidateWebCache();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `タグの更新中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    };
  }
}

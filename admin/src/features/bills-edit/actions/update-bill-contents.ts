"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import {
  type BillContentsUpdateInput,
  billContentsUpdateSchema,
  type DifficultyLevel,
} from "../types/bill-contents";

export type UpdateBillContentsResult =
  | { success: true }
  | { success: false; error: string };

export async function updateBillContents(
  billId: string,
  input: BillContentsUpdateInput
): Promise<UpdateBillContentsResult> {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billContentsUpdateSchema.parse(input);

    const db = getAdminFirestore();

    // 各難易度レベルのupsert
    for (const difficulty of ["normal", "hard"] as DifficultyLevel[]) {
      const data = validatedData[difficulty];

      // 空のコンテンツの場合はスキップ
      if (!data.title && !data.summary && !data.content) {
        continue;
      }

      // 既存のコンテンツを探す
      const existingQuery = await db
        .collection("bill_contents")
        .where("bill_id", "==", billId)
        .where("difficulty_level", "==", difficulty)
        .limit(1)
        .get();

      const now = new Date().toISOString();
      const contentData = {
        bill_id: billId,
        difficulty_level: difficulty,
        title: data.title || "",
        summary: data.summary || "",
        content: data.content || "",
        updated_at: now,
      };

      if (!existingQuery.empty) {
        await existingQuery.docs[0].ref.update(contentData);
      } else {
        const newDocRef = db.collection("bill_contents").doc();
        await newDocRef.set({
          ...contentData,
          id: newDocRef.id,
          created_at: now,
        });
      }
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true };
  } catch (error) {
    console.error("Update bill contents error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "議案コンテンツの更新中にエラーが発生しました";

    return { success: false, error: errorMessage };
  }
}

"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import { type BillCreateInput, billCreateSchema } from "../types";

export async function createBill(input: BillCreateInput) {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billCreateSchema.parse(input);

    const now = new Date().toISOString();
    const insertData = {
      ...validatedData,
      published_at: validatedData.published_at
        ? new Date(validatedData.published_at).toISOString()
        : null,
      publish_status: "draft" as const,
      tag_ids: [],
      created_at: now,
      updated_at: now,
    };

    const db = getAdminFirestore();
    const docRef = db.collection("bills").doc();
    await docRef.set({
      ...insertData,
      id: docRef.id,
    });

    // web側のキャッシュを無効化
    await invalidateWebCache();
  } catch (error) {
    console.error("Create bill error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案の作成中にエラーが発生しました");
  }

  // 成功したら一覧ページへリダイレクト
  redirect("/bills");
}

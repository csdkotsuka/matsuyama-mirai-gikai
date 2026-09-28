"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { CreateTagInput } from "../types";

export async function createTag(input: CreateTagInput) {
  try {
    await requireAdmin();

    const label = input.label?.trim();
    if (!label) {
      return { error: "タグ名を入力してください" };
    }

    const db = getAdminFirestore();

    // 重複チェック
    const existing = await db
      .collection("tags")
      .where("label", "==", label)
      .limit(1)
      .get();

    if (!existing.empty) {
      return { error: "このタグ名は既に存在します" };
    }

    const docRef = db.collection("tags").doc();
    const now = new Date().toISOString();
    const tagData = {
      id: docRef.id,
      label,
      description: null,
      featured_priority: null,
      created_at: now,
      updated_at: now,
    };

    await docRef.set(tagData);

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { data: tagData };
  } catch (error) {
    console.error("Create tag error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "タグの作成中にエラーが発生しました" };
  }
}

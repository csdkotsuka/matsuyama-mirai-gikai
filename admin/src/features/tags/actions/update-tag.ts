"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { UpdateTagInput } from "../types";

export async function updateTag(input: UpdateTagInput) {
  try {
    await requireAdmin();

    const label = input.label?.trim();
    if (!label) {
      return { error: "タグ名を入力してください" };
    }

    const db = getAdminFirestore();

    // 他のタグとの重複チェック
    const existing = await db
      .collection("tags")
      .where("label", "==", label)
      .get();

    const isDuplicate = existing.docs.some((doc) => doc.id !== input.id);
    if (isDuplicate) {
      return { error: "このタグ名は既に存在します" };
    }

    const docRef = db.collection("tags").doc(input.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { error: "タグが見つかりません" };
    }

    const updateData = {
      label,
      description: input.description ?? null,
      featured_priority: input.featured_priority ?? null,
      updated_at: new Date().toISOString(),
    };

    await docRef.update(updateData);

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { data: { id: input.id, ...docSnap.data(), ...updateData } };
  } catch (error) {
    console.error("Update tag error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "タグの更新中にエラーが発生しました" };
  }
}

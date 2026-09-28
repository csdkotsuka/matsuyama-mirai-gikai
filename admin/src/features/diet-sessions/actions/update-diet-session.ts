"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { UpdateDietSessionInput } from "../types";

export async function updateDietSession(input: UpdateDietSessionInput) {
  try {
    await requireAdmin();

    if (!input.name || input.name.trim().length === 0) {
      return { error: "国会名を入力してください" };
    }

    if (!input.start_date) {
      return { error: "開始日を入力してください" };
    }

    if (!input.end_date) {
      return { error: "終了日を入力してください" };
    }

    if (input.slug && !/^[a-z0-9-]+$/.test(input.slug)) {
      return {
        error: "スラッグは半角英小文字、数字、ハイフンのみ使用できます",
      };
    }

    const startDate = new Date(input.start_date);
    const endDate = new Date(input.end_date);

    if (endDate < startDate) {
      return { error: "終了日は開始日以降の日付を指定してください" };
    }

    const db = getAdminFirestore();
    const docRef = db.collection("diet_sessions").doc(input.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { error: "国会会期が見つかりません" };
    }

    const updateData = {
      name: input.name.trim(),
      slug: input.slug?.trim() || null,
      shugiin_url: input.shugiin_url?.trim() || null,
      start_date: input.start_date,
      end_date: input.end_date,
      updated_at: new Date().toISOString(),
    };

    await docRef.update(updateData);

    await invalidateWebCache();
    return { data: { id: input.id, ...docSnap.data(), ...updateData } };
  } catch (error) {
    console.error("Update diet session error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "国会会期の更新中にエラーが発生しました" };
  }
}

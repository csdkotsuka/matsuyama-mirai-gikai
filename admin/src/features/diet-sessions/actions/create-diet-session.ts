"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { CreateDietSessionInput } from "../types";

export async function createDietSession(input: CreateDietSessionInput) {
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
    const docRef = db.collection("diet_sessions").doc();
    const now = new Date().toISOString();

    const data = {
      id: docRef.id,
      name: input.name.trim(),
      slug: input.slug?.trim() || null,
      shugiin_url: input.shugiin_url?.trim() || null,
      start_date: input.start_date,
      end_date: input.end_date,
      created_at: now,
      updated_at: now,
    };

    await docRef.set(data);

    await invalidateWebCache();
    return { data };
  } catch (error) {
    console.error("Create diet session error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "国会会期の作成中にエラーが発生しました" };
  }
}

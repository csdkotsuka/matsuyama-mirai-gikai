"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import { type InterviewConfigInput, interviewConfigSchema } from "../types";

export type UpsertInterviewConfigResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function upsertInterviewConfig(
  billId: string,
  input: InterviewConfigInput
): Promise<UpsertInterviewConfigResult> {
  try {
    await requireAdmin();

    // バリデーション
    const validatedData = interviewConfigSchema.parse(input);

    const db = getAdminFirestore();
    const existing = await db
      .collection("interview_configs")
      .where("bill_id", "==", billId)
      .limit(1)
      .get();

    const now = new Date().toISOString();
    const configData = {
      bill_id: billId,
      status: validatedData.status,
      themes: validatedData.themes || [],
      knowledge_source: validatedData.knowledge_source || null,
      updated_at: now,
    };

    let id: string;
    if (!existing.empty) {
      const doc = existing.docs[0];
      id = doc.id;
      await doc.ref.update(configData);
    } else {
      const docRef = db.collection("interview_configs").doc();
      id = docRef.id;
      await docRef.set({
        ...configData,
        id,
        created_at: now,
      });
    }

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Upsert interview config error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "インタビュー設定の保存中にエラーが発生しました",
    };
  }
}

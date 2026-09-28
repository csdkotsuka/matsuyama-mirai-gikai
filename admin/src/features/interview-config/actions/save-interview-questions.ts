"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import {
  type InterviewQuestionsInput,
  interviewQuestionsInputSchema,
} from "../types";

export type SaveInterviewQuestionsResult =
  | { success: true }
  | { success: false; error: string };

export async function saveInterviewQuestions(
  interviewConfigId: string,
  questions: InterviewQuestionsInput
): Promise<SaveInterviewQuestionsResult> {
  try {
    await requireAdmin();

    // バリデーション
    const validatedQuestions = interviewQuestionsInputSchema.parse(questions);

    const db = getAdminFirestore();

    // 既存の質問を全て削除
    const existingSnap = await db
      .collection("interview_questions")
      .where("interview_config_id", "==", interviewConfigId)
      .get();

    const batch = db.batch();
    existingSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 新しい質問を一括挿入
    const now = new Date().toISOString();
    validatedQuestions.forEach((question, index) => {
      const docRef = db.collection("interview_questions").doc();
      batch.set(docRef, {
        id: docRef.id,
        interview_config_id: interviewConfigId,
        question: question.question,
        instruction: question.instruction || null,
        quick_replies: question.quick_replies || null,
        question_order: index + 1,
        created_at: now,
        updated_at: now,
      });
    });

    await batch.commit();

    // web側のキャッシュを無効化
    await invalidateWebCache();

    return { success: true };
  } catch (error) {
    console.error("Save interview questions error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "質問の保存中にエラーが発生しました",
    };
  }
}

import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { InterviewQuestion } from "../types";

export async function getInterviewQuestions(
  interviewConfigId: string
): Promise<InterviewQuestion[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("interview_questions")
      .where("interview_config_id", "==", interviewConfigId)
      .orderBy("question_order", "asc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        interview_config_id: data.interview_config_id,
        question: data.question || "",
        instruction: data.instruction ?? null,
        quick_replies: Array.isArray(data.quick_replies)
          ? data.quick_replies
          : null,
        question_order: data.question_order ?? 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    });
  } catch (error) {
    console.error("Failed to fetch interview questions:", error);
    return [];
  }
}

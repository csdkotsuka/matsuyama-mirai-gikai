import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";

interface SaveInterviewMessageParams {
  sessionId: string;
  role: "assistant" | "user";
  content: string;
}

/**
 * インタビューメッセージをDBに保存
 */
export async function saveInterviewMessage({
  sessionId,
  role,
  content,
}: SaveInterviewMessageParams): Promise<void> {
  try {
    const db = getAdminFirestore();

    await db.collection("interview_messages").add({
      interview_session_id: sessionId,
      role,
      content,
      created_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Failed to save interview message:", error);
    throw new Error(
      `Failed to save interview message: ${error?.message || error}`
    );
  }
}

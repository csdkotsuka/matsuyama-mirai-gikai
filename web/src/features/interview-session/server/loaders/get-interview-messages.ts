import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { InterviewMessage } from "../../shared/types";
import { verifySessionOwnership } from "../utils/verify-session-ownership";

export async function getInterviewMessages(
  sessionId: string
): Promise<InterviewMessage[]> {
  const ownershipResult = await verifySessionOwnership(sessionId);

  if (!ownershipResult.authorized) {
    console.error(
      "Unauthorized access to interview messages:",
      ownershipResult.error
    );
    return [];
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("interview_messages")
      .where("session_id", "==", sessionId)
      .orderBy("created_at", "asc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        interview_session_id: sessionId,
        session_id: sessionId,
        role: data.role,
        content: data.content,
        created_at: data.created_at,
      };
    });
  } catch (error) {
    console.error("Failed to fetch interview messages:", error);
    return [];
  }
}

import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { InterviewConfig } from "../types";

export async function getInterviewConfig(
  billId: string
): Promise<InterviewConfig | null> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("interview_configs")
      .where("bill_id", "==", billId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      bill_id: data.bill_id,
      status: data.status || "closed",
      themes: Array.isArray(data.themes) ? data.themes : [],
      knowledge_source: data.knowledge_source ?? null,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error("Failed to fetch interview config:", error);
    return null;
  }
}

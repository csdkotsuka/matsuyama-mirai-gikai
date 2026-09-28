import type { InterviewConfig } from "@mirai-gikai/firebase";
import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type { InterviewConfig };

export async function getInterviewConfig(
  billId: string
): Promise<InterviewConfig | null> {
  return _getCachedInterviewConfig(billId);
}

const _getCachedInterviewConfig = unstable_cache(
  async (billId: string): Promise<InterviewConfig | null> => {
    try {
      const db = getAdminFirestore();
      const snapshot = await db
        .collection("interview_configs")
        .where("bill_id", "==", billId)
        .where("status", "==", "public")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as InterviewConfig;
    } catch (error) {
      console.error("Failed to fetch interview config:", error);
      return null;
    }
  },
  ["interview-config"],
  {
    revalidate: 600, // 10分（600秒）
    tags: [CACHE_TAGS.BILLS],
  }
);

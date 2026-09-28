import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { getPreviousDietSession } from "@/features/diet-sessions/server/loaders/get-previous-diet-session";
import type { DietSession } from "@/features/diet-sessions/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent, BillContent } from "../../shared/types";

const MAX_PREVIEW_BILLS = 5;

export type PreviousSessionBillsResult = {
  session: DietSession;
  bills: BillWithContent[];
} | null;

export async function getPreviousSessionBills(): Promise<PreviousSessionBillsResult> {
  const previousSession = await getPreviousDietSession();
  if (!previousSession) {
    return null;
  }

  const difficultyLevel = await getDifficultyLevel();
  const bills = await _getCachedPreviousSessionBills(
    previousSession.id,
    difficultyLevel
  );

  return {
    session: previousSession,
    bills,
  };
}

const _getCachedPreviousSessionBills = unstable_cache(
  async (
    dietSessionId: string,
    difficultyLevel: DifficultyLevelEnum
  ): Promise<BillWithContent[]> => {
    try {
      const db = getAdminFirestore();

      const [billsSnap, contentsSnap, tagsSnap] = await Promise.all([
        db
          .collection("bills")
          .where("diet_session_id", "==", dietSessionId)
          .where("publish_status", "==", "published")
          .get(),
        db
          .collection("bill_contents")
          .where("difficulty_level", "==", difficultyLevel)
          .get(),
        db.collection("tags").get(),
      ]);

      const contentMap = new Map<string, BillContent>();
      contentsSnap.docs.forEach((doc) => {
        const data = doc.data() as BillContent;
        contentMap.set(data.bill_id, { ...data, id: doc.id });
      });

      const tagMap = new Map<string, { id: string; label: string }>();
      tagsSnap.docs.forEach((doc) => {
        tagMap.set(doc.id, { id: doc.id, label: doc.data().label });
      });

      const bills: BillWithContent[] = billsSnap.docs.map((doc) => {
        const data = doc.data();
        const tagIds: string[] = Array.isArray(data.tag_ids)
          ? data.tag_ids
          : [];
        const tags = tagIds
          .map((id) => tagMap.get(id))
          .filter(Boolean) as Array<{ id: string; label: string }>;

        return {
          id: doc.id,
          ...data,
          bill_content: contentMap.get(doc.id),
          tags,
        } as BillWithContent;
      });

      bills.sort((a, b) =>
        (b.published_at || "").localeCompare(a.published_at || "")
      );

      return bills.slice(0, MAX_PREVIEW_BILLS);
    } catch (error) {
      console.error("Failed to fetch previous session bills:", error);
      return [];
    }
  },
  ["previous-session-bills"],
  {
    revalidate: 600,
    tags: [CACHE_TAGS.BILLS],
  }
);

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ComingSoonBill, BillContent } from "../../shared/types";

export async function getComingSoonBills(): Promise<ComingSoonBill[]> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedComingSoonBills(difficultyLevel);
}

const _getCachedComingSoonBills = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<ComingSoonBill[]> => {
    try {
      const db = getAdminFirestore();

      const [billsSnap, contentsSnap] = await Promise.all([
        db
          .collection("bills")
          .where("publish_status", "==", "coming_soon")
          .get(),
        db.collection("bill_contents").get(),
      ]);

      const contentsByBillId = new Map<string, BillContent[]>();
      contentsSnap.docs.forEach((doc) => {
        const data = doc.data() as BillContent;
        if (!contentsByBillId.has(data.bill_id)) {
          contentsByBillId.set(data.bill_id, []);
        }
        contentsByBillId.get(data.bill_id)!.push({ ...data, id: doc.id });
      });

      const bills: ComingSoonBill[] = billsSnap.docs.map((doc) => {
        const bill = doc.data();
        const contents = contentsByBillId.get(doc.id) || [];

        const preferredContent = contents.find(
          (c) => c.difficulty_level === difficultyLevel
        );
        const fallbackContent =
          contents.find((c) => c.difficulty_level === "normal") || contents[0];

        return {
          id: doc.id,
          name: bill.name,
          title: preferredContent?.title || fallbackContent?.title || null,
          originating_house: bill.originating_house,
          shugiin_url: bill.shugiin_url ?? null,
        };
      });

      return bills;
    } catch (error) {
      console.error("Failed to fetch coming soon bills:", error);
      return [];
    }
  },
  ["coming-soon-bills-list"],
  {
    revalidate: 600,
    tags: [CACHE_TAGS.BILLS],
  }
);

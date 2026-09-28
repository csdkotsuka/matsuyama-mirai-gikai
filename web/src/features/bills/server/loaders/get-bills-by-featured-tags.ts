import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type {
  BillsByTag,
  BillWithContent,
  BillContent,
} from "../../shared/types";

export async function getBillsByFeaturedTags(): Promise<BillsByTag[]> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedBillsByFeaturedTags(difficultyLevel);
}

const _getCachedBillsByFeaturedTags = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<BillsByTag[]> => {
    try {
      const db = getAdminFirestore();

      const [tagsSnap, billsSnap, contentsSnap] = await Promise.all([
        db.collection("tags").get(),
        db.collection("bills").where("publish_status", "==", "published").get(),
        db
          .collection("bill_contents")
          .where("difficulty_level", "==", difficultyLevel)
          .get(),
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

      // featured_priority を持つタグを抽出
      const featuredTags = tagsSnap.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            label: data.label,
            description: data.description,
            featured_priority: data.featured_priority,
          };
        })
        .filter(
          (t) =>
            t.featured_priority !== null && t.featured_priority !== undefined
        );

      featuredTags.sort(
        (a, b) => (a.featured_priority || 0) - (b.featured_priority || 0)
      );

      const allBills: BillWithContent[] = billsSnap.docs.map((doc) => {
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

      const results: BillsByTag[] = [];

      for (const fTag of featuredTags) {
        const billsForTag = allBills.filter(
          (bill) =>
            Array.isArray(bill.tag_ids) && bill.tag_ids.includes(fTag.id)
        );

        if (billsForTag.length > 0) {
          results.push({
            tag: {
              id: fTag.id,
              label: fTag.label,
              description: fTag.description ?? undefined,
              priority: fTag.featured_priority ?? -1,
            },
            bills: billsForTag,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Failed to fetch bills by featured tags:", error);
      return [];
    }
  },
  ["featured-bills-list"],
  {
    revalidate: 600,
    tags: [CACHE_TAGS.BILLS],
  }
);

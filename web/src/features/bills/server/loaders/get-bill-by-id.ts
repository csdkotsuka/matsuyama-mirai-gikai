import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../../shared/types";
import { getBillContentWithDifficulty } from "./helpers/get-bill-content";

export async function getBillById(id: string): Promise<BillWithContent | null> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedBillById(id, difficultyLevel);
}

const _getCachedBillById = unstable_cache(
  async (
    id: string,
    difficultyLevel: DifficultyLevelEnum
  ): Promise<BillWithContent | null> => {
    try {
      const db = getAdminFirestore();

      const [billDoc, stanceSnap, billContent, tagsSnap] = await Promise.all([
        db.collection("bills").doc(id).get(),
        db
          .collection("mirai_stances")
          .where("bill_id", "==", id)
          .limit(1)
          .get(),
        getBillContentWithDifficulty(id, difficultyLevel),
        db.collection("tags").get(),
      ]);

      if (!billDoc.exists) {
        return null;
      }

      const billData = billDoc.data()!;
      // 公開済み議案のみ
      if (billData.publish_status !== "published") {
        return null;
      }

      const miraiStance = !stanceSnap.empty
        ? ({ id: stanceSnap.docs[0].id, ...stanceSnap.docs[0].data() } as any)
        : undefined;

      const tagMap = new Map<string, { id: string; label: string }>();
      tagsSnap.docs.forEach((doc: any) => {
        tagMap.set(doc.id, { id: doc.id, label: doc.data().label });
      });

      const tagIds: string[] = Array.isArray(billData.tag_ids)
        ? billData.tag_ids
        : [];
      const tags = tagIds
        .map((tagId) => tagMap.get(tagId))
        .filter(Boolean) as Array<{ id: string; label: string }>;

      return {
        id: billDoc.id,
        ...billData,
        mirai_stance: miraiStance,
        bill_content: billContent || undefined,
        tags,
      } as BillWithContent;
    } catch (error) {
      console.error("Failed to fetch bill:", error);
      return null;
    }
  },
  ["bill-by-id"],
  {
    revalidate: 600,
    tags: [CACHE_TAGS.BILLS],
  }
);

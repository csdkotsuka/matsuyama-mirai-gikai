import { getAdminFirestore } from "@mirai-gikai/firebase";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { BillWithContent } from "../../shared/types";
import { getBillContentWithDifficulty } from "./helpers/get-bill-content";

/**
 * 管理者用: 公開/非公開問わず議案を取得
 * プレビュー機能で使用
 * キャッシュなしで常に最新のデータを取得
 */
export async function getBillByIdAdmin(
  id: string
): Promise<BillWithContent | null> {
  const difficultyLevel = await getDifficultyLevel();
  try {
    const db = getAdminFirestore();

    const [billDoc, stanceSnap, billContent, tagsSnap] = await Promise.all([
      db.collection("bills").doc(id).get(),
      db.collection("mirai_stances").where("bill_id", "==", id).limit(1).get(),
      getBillContentWithDifficulty(id, difficultyLevel),
      db.collection("tags").get(),
    ]);

    if (!billDoc.exists) {
      return null;
    }

    const billData = billDoc.data()!;
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
    console.error("Failed to fetch bill (admin):", error);
    return null;
  }
}

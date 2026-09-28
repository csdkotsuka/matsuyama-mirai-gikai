import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { BillContent } from "@/features/bills/shared/types";

/**
 * 指定された難易度の議案コンテンツを取得
 * @param billId 議案ID
 * @param difficultyLevel 難易度レベル
 */
export async function getBillContentWithDifficulty(
  billId: string,
  difficultyLevel: DifficultyLevelEnum
): Promise<BillContent | null> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("bill_contents")
      .where("bill_id", "==", billId)
      .where("difficulty_level", "==", difficultyLevel)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as Omit<BillContent, "id">),
    };
  } catch (error) {
    console.error("Failed to fetch bill content:", error);
    return null;
  }
}

import { getAdminFirestore } from "@mirai-gikai/firebase";

/**
 * 議案に紐づくタグIDの配列を取得する
 */
export async function getBillTagIds(billId: string): Promise<string[]> {
  try {
    const db = getAdminFirestore();
    const docSnap = await db.collection("bills").doc(billId).get();

    if (!docSnap.exists) {
      return [];
    }

    const data = docSnap.data();
    return Array.isArray(data?.tag_ids) ? data.tag_ids : [];
  } catch (error: any) {
    console.error("Failed to get bill tags:", error);
    throw new Error(`議案のタグ取得に失敗しました: ${error.message}`);
  }
}

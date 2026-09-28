import { getAdminFirestore, type Bill } from "@mirai-gikai/firebase";

export async function getBills(): Promise<Bill[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("bills")
      .orderBy("created_at", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Bill, "id">),
    }));
  } catch (error: any) {
    console.error("Failed to get bills:", error);
    throw new Error(`議案の取得に失敗しました: ${error.message}`);
  }
}

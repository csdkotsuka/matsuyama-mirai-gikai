import { getAdminFirestore, type Bill } from "@mirai-gikai/firebase";

export async function getBillById(id: string): Promise<Bill | null> {
  try {
    const db = getAdminFirestore();
    const docSnap = await db.collection("bills").doc(id).get();

    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<Bill, "id">),
    };
  } catch (error) {
    console.error("Failed to fetch bill:", error);
    return null;
  }
}

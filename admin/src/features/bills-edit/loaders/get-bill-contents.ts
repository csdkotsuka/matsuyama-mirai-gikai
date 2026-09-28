import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import type { BillContent } from "../types/bill-contents";

export async function getBillContents(billId: string): Promise<BillContent[]> {
  try {
    await requireAdmin();

    const db = getAdminFirestore();
    const snapshot = await db
      .collection("bill_contents")
      .where("bill_id", "==", billId)
      .get();

    const contents: BillContent[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<BillContent, "id">),
    }));

    return contents;
  } catch (error) {
    console.error("Get bill contents error:", error);
    throw error;
  }
}

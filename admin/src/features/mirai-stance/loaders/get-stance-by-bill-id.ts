import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { MiraiStance } from "../types";

export async function getStanceByBillId(
  billId: string
): Promise<MiraiStance | null> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("mirai_stances")
      .where("bill_id", "==", billId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      bill_id: data.bill_id,
      type: data.type,
      comment: data.comment,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error("Failed to fetch stance:", error);
    return null;
  }
}

"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/auth-server";

export async function deleteBill(id: string) {
  try {
    await requireAdmin();

    const db = getAdminFirestore();

    // 議案ドキュメントの削除
    await db.collection("bills").doc(id).delete();

    // 関連する bill_contents も削除
    const contentsSnap = await db
      .collection("bill_contents")
      .where("bill_id", "==", id)
      .get();
    const batch = db.batch();
    contentsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 関連する mirai_stances も削除
    const stancesSnap = await db
      .collection("mirai_stances")
      .where("bill_id", "==", id)
      .get();
    stancesSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // キャッシュをリフレッシュ
    revalidatePath("/bills");
  } catch (error) {
    console.error("Delete bill error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案の削除中にエラーが発生しました");
  }
}

"use server";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import type { Bill } from "../types";

/**
 * 議案を複製する
 * 元の議案とそのコンテンツを複製し、新しい議案として作成する
 */
export async function duplicateBill(billId: string) {
  await requireAdmin();

  // 元の議案を取得
  const originalBill = await _fetchOriginalBill(billId);
  if (!originalBill.success) {
    return originalBill;
  }

  // 新しい議案を作成
  const newBill = await _createDuplicateBill(originalBill.data);
  if (!newBill.success) {
    return newBill;
  }

  // コンテンツを複製
  const contentResult = await _duplicateContents(billId, newBill.data.id);
  if (!contentResult.success) {
    return contentResult;
  }

  revalidatePath("/bills");
  return { success: true, data: { billId: newBill.data.id } };
}

/**
 * 元の議案を取得
 */
async function _fetchOriginalBill(billId: string) {
  const db = getAdminFirestore();
  const docSnap = await db.collection("bills").doc(billId).get();

  if (!docSnap.exists) {
    return {
      success: false as const,
      error: "元の議案が見つかりません",
    };
  }

  return {
    success: true as const,
    data: { id: docSnap.id, ...(docSnap.data() as Omit<Bill, "id">) },
  };
}

/**
 * 複製した議案を作成
 */
async function _createDuplicateBill(originalBill: Bill) {
  const db = getAdminFirestore();
  const {
    id: _,
    created_at: __,
    updated_at: ___,
    ...billWithoutId
  } = originalBill;

  const docRef = db.collection("bills").doc();
  const insertData = {
    ...billWithoutId,
    id: docRef.id,
    name: `${originalBill.name} (複製)`,
    publish_status: "draft" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    await docRef.set(insertData);
    return { success: true as const, data: { id: docRef.id } };
  } catch (error) {
    console.error("Error creating duplicate bill:", error);
    return {
      success: false as const,
      error: "新しい議案の作成に失敗しました",
    };
  }
}

/**
 * 議案のコンテンツを複製
 */
async function _duplicateContents(originalBillId: string, newBillId: string) {
  const db = getAdminFirestore();
  const contentsSnap = await db
    .collection("bill_contents")
    .where("bill_id", "==", originalBillId)
    .get();

  if (contentsSnap.empty) {
    return { success: true as const };
  }

  const batch = db.batch();
  for (const doc of contentsSnap.docs) {
    const data = doc.data();
    const newDocRef = db.collection("bill_contents").doc();
    batch.set(newDocRef, {
      ...data,
      id: newDocRef.id,
      bill_id: newBillId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  try {
    await batch.commit();
    return { success: true as const };
  } catch (error) {
    console.error("Error duplicating contents:", error);
    return {
      success: false as const,
      error: "コンテンツの複製に失敗しました",
    };
  }
}

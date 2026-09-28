import { getAdminFirestore } from "@mirai-gikai/firebase";

export async function validatePreviewToken(
  billId: string,
  token?: string
): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("preview_tokens")
      .where("bill_id", "==", billId)
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return false;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const expiresAt = new Date(data.expires_at);
    return expiresAt > new Date();
  } catch (error) {
    console.error("Error validating preview token:", error);
    return false;
  }
}

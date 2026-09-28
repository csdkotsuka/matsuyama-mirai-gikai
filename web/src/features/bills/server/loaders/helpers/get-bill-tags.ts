import { getAdminFirestore } from "@mirai-gikai/firebase";

/**
 * 複数のbill_idに紐づくタグを一括取得し、bill_idごとにグループ化して返す
 */
export async function fetchTagsByBillIds(
  _client: any,
  billIds: string[]
): Promise<Map<string, Array<{ id: string; label: string }>>> {
  if (billIds.length === 0) {
    return new Map();
  }

  try {
    const db = getAdminFirestore();
    const [billsSnap, tagsSnap] = await Promise.all([
      db.collection("bills").where("id", "in", billIds.slice(0, 30)).get(),
      db.collection("tags").get(),
    ]);

    const tagMap = new Map<string, { id: string; label: string }>();
    tagsSnap.docs.forEach((doc) => {
      tagMap.set(doc.id, { id: doc.id, label: doc.data().label });
    });

    const result = new Map<string, Array<{ id: string; label: string }>>();
    billsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const tagIds: string[] = Array.isArray(data.tag_ids) ? data.tag_ids : [];
      const tags = tagIds.map((id) => tagMap.get(id)).filter(Boolean) as Array<{
        id: string;
        label: string;
      }>;
      result.set(doc.id, tags);
    });

    return result;
  } catch (error) {
    console.error("Failed to fetch tags by bill ids:", error);
    return new Map();
  }
}

import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { TagWithBillCount } from "../types";

export async function loadTags(): Promise<TagWithBillCount[]> {
  try {
    const db = getAdminFirestore();

    const [tagsSnap, billsSnap] = await Promise.all([
      db.collection("tags").get(),
      db.collection("bills").get(),
    ]);

    // 各タグの議案数を計算
    const tagCountMap = new Map<string, number>();
    for (const billDoc of billsSnap.docs) {
      const data = billDoc.data();
      const tagIds: string[] = Array.isArray(data.tag_ids) ? data.tag_ids : [];
      for (const tagId of tagIds) {
        tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
      }
    }

    const tags: TagWithBillCount[] = tagsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        label: data.label || "",
        description: data.description ?? null,
        featured_priority: data.featured_priority ?? null,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        bill_count: tagCountMap.get(doc.id) || 0,
      };
    });

    // ソート: featured_priority 昇順 (nulls last) -> created_at 昇順
    tags.sort((a, b) => {
      if (a.featured_priority !== null && b.featured_priority !== null) {
        if (a.featured_priority !== b.featured_priority) {
          return a.featured_priority - b.featured_priority;
        }
      } else if (a.featured_priority !== null) {
        return -1;
      } else if (b.featured_priority !== null) {
        return 1;
      }
      return (a.created_at || "").localeCompare(b.created_at || "");
    });

    return tags;
  } catch (error: any) {
    console.error("Failed to load tags:", error);
    throw new Error(`タグの取得に失敗しました: ${error.message}`);
  }
}

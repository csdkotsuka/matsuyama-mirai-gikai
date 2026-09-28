import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { DietSession } from "../types";

export async function loadDietSessions(): Promise<DietSession[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("diet_sessions")
      .orderBy("start_date", "desc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug ?? null,
        shugiin_url: data.shugiin_url ?? null,
        start_date: data.start_date || "",
        end_date: data.end_date || "",
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };
    });
  } catch (error: any) {
    console.error("Failed to load diet sessions:", error);
    throw new Error(`国会会期の取得に失敗しました: ${error.message}`);
  }
}

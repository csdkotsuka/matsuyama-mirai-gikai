import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";

/**
 * 前回の国会会期を取得
 * 最新のセッション（start_date順）から2番目のセッションを返す
 * 2つ以上のセッションがない場合はnullを返す
 */
export async function getPreviousDietSession(): Promise<DietSession | null> {
  return _getCachedPreviousDietSession();
}

const _getCachedPreviousDietSession = unstable_cache(
  async (): Promise<DietSession | null> => {
    try {
      const db = getAdminFirestore();

      const snapshot = await db
        .collection("diet_sessions")
        .orderBy("start_date", "desc")
        .limit(2)
        .get();

      if (snapshot.size < 2) {
        return null;
      }

      const doc = snapshot.docs[1];
      return {
        id: doc.id,
        ...doc.data(),
      } as DietSession;
    } catch (error) {
      console.error("Failed to fetch previous diet session:", error);
      return null;
    }
  },
  ["previous-diet-session"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);

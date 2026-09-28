import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";

/**
 * slugで国会会期を取得
 */
export async function getDietSessionBySlug(
  slug: string
): Promise<DietSession | null> {
  return _getCachedDietSessionBySlug(slug);
}

const _getCachedDietSessionBySlug = unstable_cache(
  async (slug: string): Promise<DietSession | null> => {
    try {
      const db = getAdminFirestore();
      const snapshot = await db
        .collection("diet_sessions")
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as DietSession;
    } catch (error) {
      console.error("Failed to fetch diet session by slug:", error);
      return null;
    }
  },
  ["diet-session-by-slug"],
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);

import { getAdminFirestore } from "@mirai-gikai/firebase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";

/**
 * 指定日時点で開催中の国会会期を取得
 * 指定日が開始日と終了日の範囲内にある会期を返す
 */
export async function getCurrentDietSession(
  date: Date
): Promise<DietSession | null> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const targetDate = `${year}-${month}-${day}`;

  return _getCachedCurrentDietSession(targetDate);
}

const _getCachedCurrentDietSession = unstable_cache(
  async (targetDate: string): Promise<DietSession | null> => {
    try {
      const db = getAdminFirestore();
      const snapshot = await db.collection("diet_sessions").get();

      const matching = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((session: any) => {
          return (
            session.start_date <= targetDate && session.end_date >= targetDate
          );
        }) as DietSession[];

      if (matching.length === 0) {
        // 開催中がなければ、最新の会期を返すフォールバック
        const allSessions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DietSession[];
        allSessions.sort((a, b) => b.start_date.localeCompare(a.start_date));
        return allSessions[0] || null;
      }

      matching.sort((a, b) => b.start_date.localeCompare(a.start_date));
      return matching[0];
    } catch (error) {
      console.error("Failed to fetch current diet session:", error);
      return null;
    }
  },
  ["current-diet-session"],
  {
    revalidate: 3600,
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);

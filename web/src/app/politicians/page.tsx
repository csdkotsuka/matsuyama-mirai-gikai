import { Container } from "@/components/layouts/container";
import Link from "next/link";
import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { Politician } from "@mirai-gikai/firebase";
import { Users, MessageSquare, Building2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "議員一覧・発言まとめ | 松山みらい議会",
  description: "松山市議会議員および愛媛県議会議員の発言一覧と活動記録",
};

export const dynamic = "force-dynamic";

export default async function PoliticiansPage() {
  let politicians: Politician[] = [];

  try {
    const db = getAdminFirestore();

    // 議員一覧を取得
    const politiciansSnap = await db.collection("politicians").get();
    politicians = politiciansSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Politician[];
  } catch (error) {
    console.error("Failed to load politicians:", error);
  }

  // 議会ごとにグループ分け
  const matsuyamaMembers = politicians.filter(
    (p) => p.council_id === "matsuyama"
  );
  const ehimeMembers = politicians.filter((p) => p.council_id === "ehime");

  return (
    <Container className="py-20">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            <Users className="w-4 h-4" />
            議員・首長マスター
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            議員ごとの発言・活動まとめ
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            松山市議会および愛媛県議会の議員・首長の発言記録を整理しています。誰がどのような政策課題について発言しているかを確認できます。
          </p>
        </div>

        {/* 松山市議会 議員一覧 */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                松山市議会 ({matsuyamaMembers.length}名)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                市長および松山市議会議員
              </p>
            </div>
            <Link
              href="/councils/matsuyama"
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              松山市議会の会議録へ
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matsuyamaMembers.map((p) => (
              <Link
                key={p.id}
                href={`/politicians/${p.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">
                      {p.name.charAt(0)}
                    </div>
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {p.role || "議員"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    {p.furigana && (
                      <div className="text-xs text-gray-400">{p.furigana}</div>
                    )}
                  </div>

                  {p.faction && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded inline-block">
                      {p.faction}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    発言記録あり
                  </div>
                  <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                    発言一覧を見る →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 愛媛県議会 議員一覧 */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                愛媛県議会 ({ehimeMembers.length}名)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                知事および愛媛県議会議員
              </p>
            </div>
            <Link
              href="/councils/ehime"
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              愛媛県議会の会議録へ
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ehimeMembers.map((p) => (
              <Link
                key={p.id}
                href={`/politicians/${p.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">
                      {p.name.charAt(0)}
                    </div>
                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {p.role || "議員"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    {p.furigana && (
                      <div className="text-xs text-gray-400">{p.furigana}</div>
                    )}
                  </div>

                  {p.faction && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded inline-block">
                      {p.faction}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    発言記録あり
                  </div>
                  <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform">
                    発言一覧を見る →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

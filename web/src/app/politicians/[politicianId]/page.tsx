import { Container } from "@/components/layouts/container";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { Politician, Utterance, Meeting } from "@mirai-gikai/firebase";
import {
  User,
  Building2,
  Calendar,
  MessageSquare,
  ChevronLeft,
  Tag,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    politicianId: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { politicianId } = await params;
  try {
    const db = getAdminFirestore();
    const doc = await db.collection("politicians").doc(politicianId).get();
    const p = doc.exists ? (doc.data() as Politician) : null;
    return {
      title: p
        ? `${p.name}の発言一覧・プロフィール | 松山みらい議会`
        : "議員詳細 | 松山みらい議会",
    };
  } catch {
    return {
      title: "議員詳細 | 松山みらい議会",
    };
  }
}

export default async function PoliticianDetailPage({ params }: Props) {
  const { politicianId } = await params;
  const db = getAdminFirestore();

  // 議員情報を取得
  const polDoc = await db.collection("politicians").doc(politicianId).get();
  if (!polDoc.exists) {
    notFound();
  }
  const politician = { id: polDoc.id, ...polDoc.data() } as Politician;

  // この議員の発言一覧を取得（politician_id で検索）
  const utterancesSnap = await db
    .collection("utterances")
    .where("politician_id", "==", politicianId)
    .get();

  const utterances = utterancesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Utterance[];

  // 日付順・シーケンス順にソート
  utterances.sort((a, b) => {
    const dateComp = (b.session_date || "").localeCompare(a.session_date || "");
    if (dateComp !== 0) return dateComp;
    return (a.sequence_number ?? 0) - (b.sequence_number ?? 0);
  });

  // 発言トピックの集計
  const topicsMap: Record<string, number> = {};
  utterances.forEach((u) => {
    if (u.topic) {
      topicsMap[u.topic] = (topicsMap[u.topic] || 0) + 1;
    }
  });
  const sortedTopics = Object.entries(topicsMap).sort((a, b) => b[1] - a[1]);

  return (
    <Container className="py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ナビゲーション */}
        <Link
          href="/politicians"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          議員一覧に戻る
        </Link>

        {/* プロフィールカード */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary font-extrabold flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {politician.name.charAt(0)}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/councils/${politician.council_id}`}
                  className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded hover:underline"
                >
                  {politician.council_name}
                </Link>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  {politician.role || "議員"}
                </span>
                {politician.term_count && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-xs rounded">
                    当選 {politician.term_count}期
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {politician.name}
                </h1>
                {politician.furigana && (
                  <div className="text-sm text-gray-400">
                    {politician.furigana}
                  </div>
                )}
              </div>

              {politician.faction && (
                <div className="text-sm text-gray-600">
                  所属会派:{" "}
                  <span className="font-semibold text-gray-800">
                    {politician.faction}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 発言サマリー・トピック */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">登録発言数:</span>{" "}
              <span className="font-bold text-gray-900 text-base">
                {utterances.length} 件
              </span>
            </div>
            {sortedTopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-gray-400 mr-1">主な議題:</span>
                {sortedTopics.slice(0, 3).map(([topic, count]) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    #{topic} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 発言タイムライン */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              発言タイムライン ({utterances.length}件)
            </h2>
            <span className="text-xs text-gray-400">最新順</span>
          </div>

          {utterances.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              この議員の発言データはまだ登録されていません。
            </div>
          ) : (
            <div className="space-y-4">
              {utterances.map((utt) => (
                <div
                  key={utt.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-50 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono text-gray-600">
                        {utt.session_date}
                      </span>
                      {utt.meeting_name && (
                        <Link
                          href={`/councils/${utt.council_id}/${utt.meeting_id}`}
                          className="font-medium text-primary hover:underline line-clamp-1"
                        >
                          {utt.meeting_name}
                        </Link>
                      )}
                    </div>

                    {utt.topic && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        #{utt.topic}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {utt.content}
                  </p>

                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/councils/${utt.council_id}/${utt.meeting_id}`}
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      会議録の文脈全体を見る →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

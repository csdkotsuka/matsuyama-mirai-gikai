import { Container } from "@/components/layouts/container";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { Meeting, Utterance } from "@mirai-gikai/firebase";
import { Calendar, ChevronLeft, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    councilId: string;
    meetingId: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { meetingId } = await params;
  try {
    const db = getAdminFirestore();
    const meetingDoc = await db.collection("meetings").doc(meetingId).get();
    const meeting = meetingDoc.exists ? (meetingDoc.data() as Meeting) : null;

    return {
      title: meeting
        ? `${meeting.meeting_name} | 松山みらい議会`
        : "会議録 | 松山みらい議会",
    };
  } catch {
    return {
      title: "会議録 | 松山みらい議会",
    };
  }
}

export default async function MeetingDetailPage({ params }: Props) {
  const { councilId, meetingId } = await params;
  const db = getAdminFirestore();

  // 会議データを取得
  const meetingDoc = await db.collection("meetings").doc(meetingId).get();

  if (!meetingDoc.exists) {
    notFound();
  }

  const meeting = { id: meetingDoc.id, ...meetingDoc.data() } as Meeting;

  // 発言データを取得
  const utterancesSnap = await db
    .collection("utterances")
    .where("meeting_id", "==", meetingId)
    .get();

  const utterances = utterancesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Utterance[];

  utterances.sort(
    (a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0)
  );

  return (
    <Container className="py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* パンくず */}
        <Link
          href={`/councils/${councilId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {meeting.council_name}一覧に戻る
        </Link>

        {/* 会議ヘッダー */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
              {meeting.council_name}
            </span>
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {meeting.meeting_type}
            </span>
            {meeting.session_number && (
              <span className="px-2.5 py-0.5 bg-gray-50 text-gray-500 text-xs rounded">
                {meeting.session_number}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {meeting.meeting_name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              開催日: {meeting.session_date}
            </div>
            <div>発言数: {utterances.length}件</div>
            {meeting.source_url && (
              <a
                href={meeting.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 ml-auto"
              >
                公式会議録システム
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {meeting.summary && (
            <div className="mt-4 p-4 bg-blue-50/60 border border-blue-100/50 rounded-xl">
              <h2 className="text-xs font-bold text-blue-900 mb-1">
                📌 会議概要・審議ポイント
              </h2>
              <p className="text-sm text-blue-950/80 leading-relaxed">
                {meeting.summary}
              </p>
            </div>
          )}
        </div>

        {/* 発言タイムライン */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              会議録・発言一覧
            </h2>
            <span className="text-xs text-gray-400">時系列順</span>
          </div>

          {utterances.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100">
              発言データがありません。
            </div>
          ) : (
            <div className="space-y-4">
              {utterances.map((utt) => {
                const isPolitician =
                  utt.speaker_type === "politician" || !!utt.politician_id;
                const isExecutive = utt.speaker_type === "executive";
                const isChair = utt.speaker_type === "chair";

                return (
                  <div
                    key={utt.id}
                    className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                      isExecutive
                        ? "border-amber-100 bg-amber-50/20"
                        : isPolitician
                          ? "border-blue-100 hover:border-blue-200"
                          : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* アバター */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          isExecutive
                            ? "bg-amber-100 text-amber-800"
                            : isPolitician
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {utt.speaker_name.charAt(0)}
                      </div>

                      {/* 発言内容 */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {utt.politician_id ? (
                              <Link
                                href={`/politicians/${utt.politician_id}`}
                                className="font-bold text-gray-900 hover:text-primary hover:underline flex items-center gap-1"
                              >
                                {utt.speaker_name}
                                <span className="text-[10px] text-primary">
                                  [議員情報]
                                </span>
                              </Link>
                            ) : (
                              <span className="font-bold text-gray-900">
                                {utt.speaker_name}
                              </span>
                            )}

                            {utt.speaker_role && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded font-medium ${
                                  isExecutive
                                    ? "bg-amber-100/80 text-amber-800"
                                    : isPolitician
                                      ? "bg-blue-100/80 text-blue-800"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {utt.speaker_role}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {utt.topic && (
                              <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                #{utt.topic}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 font-mono">
                              #{utt.sequence_number}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          {utt.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AIチャット案内 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-center space-y-2">
          <div className="text-lg font-bold text-gray-900">
            💬 AIによる会議録要約・質疑応答
          </div>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            発言内容の自動要約や、特定の政策に関する議論の掘り下げをAIに質問できる機能を順次展開中です。
          </p>
        </div>
      </div>
    </Container>
  );
}

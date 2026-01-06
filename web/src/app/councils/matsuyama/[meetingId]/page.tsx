import { Container } from "@/components/layouts/container";
import { notFound } from "next/navigation";
import { createClient } from "@mirai-gikai/supabase/server";

type Props = {
    params: Promise<{ meetingId: string }>;
};

export async function generateMetadata({ params }: Props) {
    const { meetingId } = await params;
    const supabase = await createClient();

    const { data: meeting } = await supabase
        .from("meetings")
        .select("meeting_name")
        .eq("id", meetingId)
        .single();

    return {
        title: meeting
            ? `${meeting.meeting_name} | 松山みらい議会`
            : "会議録 | 松山みらい議会",
    };
}

export default async function MeetingDetailPage({ params }: Props) {
    const { meetingId } = await params;
    const supabase = await createClient();

    // 会議データを取得
    const { data: meeting } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .single();

    if (!meeting) {
        notFound();
    }

    // 発言データを取得
    const { data: utterances } = await supabase
        .from("utterances")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("sequence_number");

    return (
        <Container className="py-20">
            <div className="max-w-4xl mx-auto">
                {/* 会議情報 */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">
                            {meeting.council_name}
                        </span>
                        <span className="text-sm text-gray-400">›</span>
                        <span className="text-sm text-primary">{meeting.meeting_type}</span>
                    </div>

                    <h1 className="text-3xl font-bold mb-4">{meeting.meeting_name}</h1>

                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                        <div>
                            開催日:{" "}
                            {new Date(meeting.session_date).toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </div>
                    </div>

                    {meeting.summary && (
                        <div className="bg-primary/5 rounded-lg p-4">
                            <h2 className="font-bold text-sm text-primary mb-2">会議要約</h2>
                            <p className="text-gray-700">{meeting.summary}</p>
                        </div>
                    )}
                </div>

                {/* 発言一覧 */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">会議録</h2>

                    {!utterances || utterances.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <p className="text-gray-500">発言データがありません。</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {utterances.map((utterance: any) => (
                                <div
                                    key={utterance.id}
                                    className="bg-white rounded-lg p-6 shadow-sm"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-bold text-sm">
                                                    {utterance.speaker_name.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-gray-900">
                                                    {utterance.speaker_name}
                                                </span>
                                                {utterance.speaker_role && (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                                        {utterance.speaker_role}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {utterance.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AIチャット機能は後で追加 */}
                <div className="mt-12 bg-primary/5 rounded-lg p-6 text-center">
                    <p className="text-gray-700">
                        💬 この会議についてAIに質問できる機能を準備中です
                    </p>
                </div>
            </div>
        </Container>
    );
}

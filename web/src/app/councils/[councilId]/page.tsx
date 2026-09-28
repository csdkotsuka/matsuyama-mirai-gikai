import { Container } from "@/components/layouts/container";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminFirestore } from "@mirai-gikai/firebase";
import type {
  Council,
  Meeting,
  CouncilBill,
  Politician,
} from "@mirai-gikai/firebase";
import {
  Building2,
  Calendar,
  FileText,
  Users,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    councilId: string;
  }>;
}

export default async function CouncilDetailPage({ params }: Props) {
  const { councilId } = await params;

  let council: Council | null = null;
  let meetings: Meeting[] = [];
  let bills: CouncilBill[] = [];
  let politicians: Politician[] = [];

  try {
    const db = getAdminFirestore();

    // 議会情報の取得
    const councilDoc = await db.collection("councils").doc(councilId).get();
    if (!councilDoc.exists) {
      // 存在しない場合はnotFound
      return notFound();
    }
    council = { id: councilDoc.id, ...councilDoc.data() } as Council;

    // 会議録一覧
    const meetingsSnap = await db
      .collection("meetings")
      .where("council_id", "==", councilId)
      .get();
    meetings = meetingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meeting[];
    meetings.sort((a, b) =>
      (b.session_date || "").localeCompare(a.session_date || "")
    );

    // 議案一覧
    const billsSnap = await db
      .collection("council_bills")
      .where("council_id", "==", councilId)
      .get();
    bills = billsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CouncilBill[];
    bills.sort((a, b) =>
      (b.session_date || "").localeCompare(a.session_date || "")
    );

    // 所属議員一覧
    const politiciansSnap = await db
      .collection("politicians")
      .where("council_id", "==", councilId)
      .get();
    politicians = politiciansSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Politician[];
  } catch (error) {
    console.error("Failed to load council details:", error);
    return notFound();
  }

  return (
    <Container className="py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* パンくずナビ */}
        <Link
          href="/councils"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          議会ポータルに戻る
        </Link>

        {/* 議会ヘッダー */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {council.level === "prefecture" ? "都道府県議会" : "市町村議会"}
            </span>
            {council.website_url && (
              <a
                href={council.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary"
              >
                公式サイト
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900">
            {council.name}
          </h1>

          {council.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {council.description}
            </p>
          )}

          <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <div>
              <span className="text-gray-400">議員定数:</span>{" "}
              <span className="font-bold text-gray-900">
                {council.total_members ?? politicians.length}名
              </span>
            </div>
            <div>
              <span className="text-gray-400">会議録:</span>{" "}
              <span className="font-bold text-gray-900">
                {meetings.length}件
              </span>
            </div>
            <div>
              <span className="text-gray-400">提出議案:</span>{" "}
              <span className="font-bold text-gray-900">{bills.length}件</span>
            </div>
          </div>
        </div>

        {/* 所属議員・役職者一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              議員・役職者一覧 ({politicians.length}名)
            </h2>
            <Link
              href="/politicians"
              className="text-xs text-primary font-medium hover:underline"
            >
              全議員リストへ →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {politicians.map((p) => (
              <Link
                key={p.id}
                href={`/politicians/${p.id}`}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {p.role || "議員"}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 text-base">
                    {p.name}
                  </div>
                  {p.furigana && (
                    <div className="text-[10px] text-gray-400">
                      {p.furigana}
                    </div>
                  )}
                  {p.faction && (
                    <div className="text-xs text-gray-500 mt-2 line-clamp-1">
                      {p.faction}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-gray-50 text-[11px] text-primary font-medium">
                  発言をみる →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 提出議案一覧 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            審議・提出議案
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                    {bill.category || "議案"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded ${
                      bill.decision === "可決"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {bill.decision || "審議中"}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-gray-400 font-mono mb-1">
                    {bill.bill_number}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {bill.title}
                  </h3>
                </div>

                {bill.summary && (
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {bill.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                  <span>提出: {bill.proposer}</span>
                  <span>{bill.session_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 会議録一覧 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            会議録一覧
          </h2>

          <div className="space-y-3">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/councils/${councilId}/${meeting.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                    {meeting.meeting_type}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {meeting.session_date}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {meeting.meeting_name}
                </h3>

                {meeting.summary && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {meeting.summary}
                  </p>
                )}

                {meeting.topics && meeting.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {meeting.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

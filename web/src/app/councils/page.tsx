import { Container } from "@/components/layouts/container";
import Link from "next/link";
import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { Council, Meeting, CouncilBill } from "@mirai-gikai/firebase";
import { Building2, Calendar, FileText, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "地方議会・議案ポータル | 松山みらい議会",
  description: "松山市議会および愛媛県議会の議案・会議録・議員発言の一覧",
};

export const dynamic = "force-dynamic";

export default async function CouncilsPortalPage() {
  let councils: Council[] = [];
  let recentMeetings: Meeting[] = [];
  let recentBills: CouncilBill[] = [];

  try {
    const db = getAdminFirestore();

    // 議会一覧の取得
    const councilsSnap = await db.collection("councils").get();
    councils = councilsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Council[];

    // 最新の会議録（全議会から直近6件）
    const meetingsSnap = await db.collection("meetings").limit(6).get();
    recentMeetings = meetingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meeting[];
    recentMeetings.sort((a, b) =>
      (b.session_date || "").localeCompare(a.session_date || "")
    );

    // 最新の提出議案
    const billsSnap = await db.collection("council_bills").limit(6).get();
    recentBills = billsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CouncilBill[];
    recentBills.sort((a, b) =>
      (b.session_date || "").localeCompare(a.session_date || "")
    );
  } catch (error) {
    console.error("Failed to load councils portal data:", error);
  }

  return (
    <Container className="py-20">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* ヘッダーセクション */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            <Building2 className="w-4 h-4" />
            自治体議会ポータル
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            松山市議会 ＆ 愛媛県議会
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            松山市議会と愛媛県議会で審議される議案や会議録、議員一人ひとりの発言を横断的に閲覧・整理できます。
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/politicians"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Users className="w-4 h-4 text-primary" />
              議員ごとの発言を見る
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* 議会カード一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {councils.map((council) => (
            <div
              key={council.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
                    {council.level === "prefecture"
                      ? "都道府県議会"
                      : "市町村議会"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {council.prefecture}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {council.name}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {council.description}
                </p>
                <div className="flex items-center gap-6 pt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    定数 {council.total_members ?? "--"}名
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-gray-400" />
                    会議録 {council.total_meetings ?? "--"}件
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/councils/${council.id}`}
                  className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                >
                  会議録・議案を見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {council.website_url && (
                  <a
                    href={council.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    公式サイト ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 最近の提出議案 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              注目の提出議案
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                    {bill.council_name}
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
                  <h3 className="font-bold text-gray-900 text-base line-clamp-2">
                    {bill.title}
                  </h3>
                </div>

                {bill.summary && (
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {bill.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                  <span>{bill.proposer}</span>
                  <span>{bill.session_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近の会議録 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              最近の会議録
            </h2>
          </div>

          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/councils/${meeting.council_id}/${meeting.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {meeting.council_name}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {meeting.meeting_type}
                    </span>
                  </div>
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

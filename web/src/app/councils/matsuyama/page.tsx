import { Container } from "@/components/layouts/container";
import Link from "next/link";
import { getAdminFirestore } from "@mirai-gikai/firebase";

export const metadata = {
  title: "松山市議会 会議一覧 | 松山みらい議会",
  description: "松山市議会の会議録一覧",
};

export default async function MatsuyamaCouncilPage() {
  let meetings: any[] = [];
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("meetings")
      .where("council_name", "==", "松山市議会")
      .get();

    meetings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    meetings.sort((a, b) =>
      (b.session_date || "").localeCompare(a.session_date || "")
    );
  } catch (error) {
    console.error("Failed to load meetings:", error);
  }

  return (
    <Container className="py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">松山市議会 会議録</h1>
        <p className="text-gray-600 mb-8">
          松山市議会の会議録を閲覧できます。AIチャットで会議内容を検索することもできます。
        </p>

        {!meetings || meetings.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">会議録がまだ登録されていません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting: any) => (
              <Link
                key={meeting.id}
                href={`/councils/matsuyama/${meeting.id}`}
                className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-primary">
                    {meeting.meeting_name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(meeting.session_date).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>

                {meeting.summary && (
                  <p className="text-gray-700 line-clamp-3">
                    {meeting.summary}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {meeting.meeting_type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

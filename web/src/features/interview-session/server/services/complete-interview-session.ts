import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import {
  type InterviewReportData,
  interviewChatWithReportSchema,
} from "../../shared/schemas";
import type { InterviewReport } from "../../shared/types";

type CompleteInterviewSessionParams = {
  sessionId: string;
};

/**
 * メッセージからレポートを抽出する
 */
function extractReportFromMessage(content: string): InterviewReportData | null {
  try {
    const parsed = JSON.parse(content);
    const result = interviewChatWithReportSchema.safeParse(parsed);
    if (result.success) {
      return result.data.report;
    }
  } catch (e) {
    // JSONでない場合は無視
    console.error("Failed to parse report from message content", content, e);
  }
  return null;
}

/**
 * インタビューを完了し、会話中に生成されたレポートを保存する
 */
export async function completeInterviewSession({
  sessionId,
}: CompleteInterviewSessionParams): Promise<InterviewReport> {
  const db = getAdminFirestore();

  // メッセージ履歴を取得
  const messagesSnapshot = await db
    .collection("interview_messages")
    .where("interview_session_id", "==", sessionId)
    .get();

  const messages = messagesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  messages.sort((a, b) =>
    (b.created_at || "").localeCompare(a.created_at || "")
  );

  // 最新のアシスタントメッセージからレポートを抽出
  let reportData: InterviewReportData | null = null;
  for (const message of messages) {
    if (message.role === "assistant") {
      reportData = extractReportFromMessage(message.content);
      if (reportData) {
        break;
      }
    }
  }

  if (!reportData) {
    throw new Error("No report found in conversation messages");
  }

  // レポートを保存（UPSERT）
  const existingReportSnap = await db
    .collection("interview_reports")
    .where("interview_session_id", "==", sessionId)
    .limit(1)
    .get();

  const now = new Date().toISOString();
  let reportId: string;
  let report: InterviewReport;

  if (!existingReportSnap.empty) {
    const docRef = existingReportSnap.docs[0].ref;
    reportId = existingReportSnap.docs[0].id;
    const existingData = existingReportSnap.docs[0].data();

    const updateData = {
      summary: reportData.summary,
      stance: reportData.stance,
      role: reportData.role,
      role_description: reportData.role_description ?? null,
      opinions: reportData.opinions,
      updated_at: now,
    };
    await docRef.update(updateData);

    report = {
      id: reportId,
      interview_session_id: sessionId,
      is_public: existingData.is_public ?? false,
      created_at: existingData.created_at ?? now,
      ...updateData,
    } as InterviewReport;
  } else {
    const docRef = db.collection("interview_reports").doc();
    reportId = docRef.id;

    report = {
      id: reportId,
      interview_session_id: sessionId,
      summary: reportData.summary,
      stance: reportData.stance,
      role: reportData.role,
      role_description: reportData.role_description ?? undefined,
      opinions: reportData.opinions,
      is_public: false,
      created_at: now,
      updated_at: now,
    };
    await docRef.set(report);
  }

  // セッションを完了
  await db
    .collection("interview_sessions")
    .doc(sessionId)
    .update({ completed_at: now });

  return report;
}

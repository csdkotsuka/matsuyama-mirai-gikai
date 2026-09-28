import type {
  InterviewSession,
  InterviewReport,
  InterviewMessage,
} from "@mirai-gikai/firebase";

export type { InterviewSession, InterviewReport, InterviewMessage };

export type InterviewSessionWithDetails = InterviewSession & {
  message_count: number;
  interview_report: InterviewReport | null;
};

export type InterviewSessionDetail = InterviewSession & {
  interview_report: InterviewReport | null;
  interview_messages: InterviewMessage[];
};

export type SessionStatus = "completed" | "in_progress";

export function getSessionStatus(session: InterviewSession): SessionStatus {
  return session.completed_at ? "completed" : "in_progress";
}

export function formatDuration(
  startedAt: string,
  completedAt: string | null | undefined
): string {
  if (!completedAt) return "-";

  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diffMs = end.getTime() - start.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}時間${remainingMinutes}分`;
  }
  return `${minutes}分`;
}

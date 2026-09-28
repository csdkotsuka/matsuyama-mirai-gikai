import type { InterviewReport } from "@mirai-gikai/firebase";

export type { InterviewReport };
export type InterviewReportInsert = Omit<
  InterviewReport,
  "id" | "created_at" | "updated_at"
>;

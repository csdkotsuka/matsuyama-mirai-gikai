import type {
  InterviewSession,
  InterviewMessage,
  InterviewReport,
  InterviewQuestion,
} from "@mirai-gikai/firebase";

export type {
  InterviewSession,
  InterviewMessage,
  InterviewReport,
  InterviewQuestion,
};

export type InterviewSessionInsert = Omit<
  InterviewSession,
  "id" | "created_at" | "updated_at"
>;
export type InterviewSessionUpdate = Partial<InterviewSessionInsert>;

export type InterviewMessageInsert = Omit<
  InterviewMessage,
  "id" | "created_at"
>;
export type InterviewReportInsert = Omit<
  InterviewReport,
  "id" | "created_at" | "updated_at"
>;

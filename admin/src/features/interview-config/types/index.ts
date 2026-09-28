import { z } from "zod";

export interface InterviewConfig {
  id: string;
  bill_id: string;
  status: "public" | "closed";
  themes: string[];
  knowledge_source?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type InterviewConfigInsert = Omit<
  InterviewConfig,
  "id" | "created_at" | "updated_at"
>;
export type InterviewConfigUpdate = Partial<InterviewConfigInsert>;

export interface InterviewQuestion {
  id: string;
  interview_config_id: string;
  question: string;
  instruction?: string | null;
  quick_replies?: string[] | null;
  question_order: number;
  created_at?: string;
  updated_at?: string;
}

export type InterviewQuestionInsert = Omit<
  InterviewQuestion,
  "id" | "created_at" | "updated_at"
>;
export type InterviewQuestionUpdate = Partial<InterviewQuestionInsert>;

// バリデーションスキーマ
export const interviewConfigSchema = z.object({
  status: z.enum(["public", "closed"]),
  themes: z.array(z.string().min(1)).optional(),
  knowledge_source: z.string().optional(),
});

export const interviewQuestionSchema = z.object({
  question: z
    .string()
    .min(1, "質問文は必須です")
    .max(1000, "質問文は1000文字以内で入力してください"),
  instruction: z
    .string()
    .max(2000, "指示は2000文字以内で入力してください")
    .optional(),
  quick_replies: z.array(z.string().min(1)).optional(),
});

export const interviewQuestionsInputSchema = z.array(interviewQuestionSchema);

// 型定義
export type InterviewConfigInput = z.infer<typeof interviewConfigSchema>;
export type InterviewQuestionInput = z.infer<typeof interviewQuestionSchema>;
export type InterviewQuestionsInput = z.infer<
  typeof interviewQuestionsInputSchema
>;

// テキストエリアから配列への変換ヘルパー
export function textToArray(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// 配列からテキストエリア用の文字列への変換ヘルパー
export function arrayToText(array: string[] | null | undefined): string {
  if (!array || array.length === 0) return "";
  return array.join("\n");
}

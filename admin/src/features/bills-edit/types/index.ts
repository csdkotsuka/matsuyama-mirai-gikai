import type { Bill } from "@mirai-gikai/firebase";
import { z } from "zod";

export type { Bill };
export type BillUpdate = Partial<Bill>;
export type BillInsert = Omit<Bill, "id" | "created_at" | "updated_at">;

// 公開ステータス型
export type BillPublishStatus = "draft" | "published" | "coming_soon";

// 共通のバリデーションスキーマ
const billBaseSchema = z.object({
  name: z
    .string()
    .min(1, "議案名は必須です")
    .max(200, "議案名は200文字以内で入力してください"),
  status: z.enum([
    "preparing",
    "coming_soon",
    "introduced",
    "in_originating_house",
    "in_receiving_house",
    "in_other_house",
    "enacted",
    "rejected",
    "withdrawn",
    "continued",
  ]),
  originating_house: z.enum(["HR", "HC"]),
  status_note: z
    .string()
    .max(500, "ステータス備考は500文字以内で入力してください")
    .nullable(),
  published_at: z.string().optional(),
  thumbnail_url: z.string().nullable().optional(),
  share_thumbnail_url: z.string().nullable().optional(),
  shugiin_url: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .refine((val) => val === null || val.startsWith("http"), {
      message: "有効なURLを入力してください",
    })
    .optional(),
  is_featured: z.boolean(),
  diet_session_id: z.string().nullable().optional(),
});

// 更新用スキーマ
export const billUpdateSchema = billBaseSchema;
export type BillUpdateInput = z.infer<typeof billUpdateSchema>;

// 新規作成用スキーマ
export const billCreateSchema = billBaseSchema;
export type BillCreateInput = z.infer<typeof billCreateSchema>;

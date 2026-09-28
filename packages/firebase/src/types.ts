export type HouseEnum = "HR" | "HC";

export type BillStatusEnum =
  | "preparing"
  | "coming_soon"
  | "introduced"
  | "in_originating_house"
  | "in_receiving_house"
  | "in_other_house"
  | "enacted"
  | "rejected"
  | "withdrawn"
  | "continued";

export type BillPublishStatus = "draft" | "published" | "coming_soon";

export type DifficultyLevel = "normal" | "hard" | "simple" | "detailed";

export type StanceType =
  | "support"
  | "oppose"
  | "neutral"
  | "continued_deliberation"
  | "for"
  | "against"
  | "conditional_for"
  | "conditional_against"
  | "considering";

export interface DietSession {
  id: string;
  name: string;
  slug?: string | null;
  shugiin_url?: string | null;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  label: string;
  description?: string | null;
  featured_priority?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface BillContent {
  id: string;
  bill_id: string;
  difficulty_level: DifficultyLevel;
  title: string;
  summary: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface MiraiStance {
  id: string;
  bill_id: string;
  type: StanceType;
  comment?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Bill {
  id: string;
  name: string;
  originating_house: HouseEnum;
  status: BillStatusEnum;
  status_note?: string | null;
  publish_status: BillPublishStatus;
  published_at?: string | null;
  is_featured: boolean;
  diet_session_id?: string | null;
  thumbnail_url?: string | null;
  share_thumbnail_url?: string | null;
  shugiin_url?: string | null;
  tag_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface InterviewConfig {
  id: string;
  bill_id: string;
  status: "public" | "closed";
  themes: string[];
  knowledge_source?: string | null;
  created_at?: string;
  updated_at?: string;
}

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

export interface InterviewSession {
  id: string;
  interview_config_id?: string;
  bill_id?: string;
  user_id?: string | null;
  user_identifier?: string;
  started_at: string;
  completed_at?: string | null;
  archived_at?: string | null;
  is_public_by_user?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewReport {
  id: string;
  interview_session_id: string;
  session_id?: string;
  stance?: string | null;
  role?: string | null;
  role_description?: string | null;
  opinions?: any;
  summary?: string | null;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewMessage {
  id: string;
  interview_session_id?: string;
  session_id?: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface PreviewToken {
  id: string;
  bill_id: string;
  token: string;
  expires_at: string;
  created_at?: string;
}

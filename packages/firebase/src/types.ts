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

// ==========================================
// 地方議会・自治体議会・議員・発言関連の型定義
// ==========================================

export type CouncilCode = "matsuyama" | "ehime" | string;

export interface Council {
  id: string; // e.g. "matsuyama", "ehime"
  code: CouncilCode;
  name: string; // "松山市議会", "愛媛県議会"
  prefecture: string; // "愛媛県"
  level: "prefecture" | "municipality"; // 県議会 / 市町村議会
  description?: string;
  website_url?: string;
  meeting_system_url?: string;
  total_meetings?: number;
  total_members?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Politician {
  id: string; // doc ID or slug
  council_id: string; // "matsuyama" | "ehime"
  council_name: string; // "松山市議会" | "愛媛県議会"
  name: string; // "山田 太郎"
  furigana?: string; // "やまだ たろう"
  faction?: string; // 所属会派 (e.g. "自由民主党", "公明党", "無所属")
  role?: string; // "議長", "副議長", "議員", "市長", "知事", "部長"
  is_current_member?: boolean; // 現職議員かどうか
  term_count?: number; // 当選回数
  profile_image_url?: string;
  official_website?: string;
  twitter_url?: string;
  total_utterances?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Meeting {
  id: string;
  council_id: string; // "matsuyama" | "ehime"
  council_name: string; // "松山市議会" | "愛媛県議会"
  meeting_name: string; // "令和６年１２月定例会 本会議（第２日）"
  meeting_type: string; // "定例会" | "臨時会" | "委員会"
  session_year?: number; // 2024
  session_date: string; // "2024-12-05"
  session_number?: string;
  source_url?: string;
  summary?: string | null;
  topics?: string[];
  total_utterances?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Utterance {
  id: string;
  meeting_id: string;
  council_id: string; // "matsuyama" | "ehime"
  council_name?: string;
  meeting_name?: string;
  session_date?: string;
  politician_id?: string | null; // 議員マスターに紐づくID
  speaker_name: string; // "山田太郎" or "市長（野志克仁）"
  speaker_role?: string; // "議員", "市長", "副市長", "教育長", "総務部長", etc.
  speaker_type?: "politician" | "executive" | "chair" | "other"; // 議員 / 首長・理事者 / 議長 / その他
  content: string;
  sequence_number: number;
  page_number?: number;
  topic?: string;
  sentiment?: "positive" | "negative" | "neutral" | "question";
  created_at?: string;
}

export interface CouncilBill {
  id: string;
  council_id: string; // "matsuyama" | "ehime"
  council_name: string; // "松山市議会" | "愛媛県議会"
  bill_number: string; // "第1号議案"
  title: string; // "松山市一般会計補正予算"
  category?: string; // "予算", "条例", "人事", "意見書", "請願"
  proposer?: string; // "市長提出", "議員提出"
  proposer_politician_ids?: string[];
  session_date?: string; // 提出日 or 審議日
  meeting_name?: string;
  decision?: "可決" | "否決" | "継続審査" | "撤回" | "審議中" | string; // 議決結果
  decision_date?: string;
  summary?: string;
  source_url?: string;
  created_at?: string;
  updated_at?: string;
}

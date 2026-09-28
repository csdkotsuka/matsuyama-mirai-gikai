import type {
  Bill,
  BillContent,
  MiraiStance,
  HouseEnum,
  BillStatusEnum,
  BillPublishStatus,
} from "@mirai-gikai/firebase";

export type {
  Bill,
  BillContent,
  MiraiStance,
  HouseEnum,
  BillStatusEnum,
  BillPublishStatus,
};

export type BillInsert = Omit<Bill, "id" | "created_at" | "updated_at">;
export type BillUpdate = Partial<BillInsert>;

export type BillContentInsert = Omit<
  BillContent,
  "id" | "created_at" | "updated_at"
>;
export type BillContentUpdate = Partial<BillContentInsert>;

export type StanceTypeEnum =
  | "for"
  | "against"
  | "neutral"
  | "conditional_for"
  | "conditional_against"
  | "considering"
  | "continued_deliberation";

// Coming Soon議案の型（最小限の情報のみ）
export type ComingSoonBill = {
  id: string;
  name: string; // 正式名称
  title: string | null; // わかりやすいタイトル（bill_contentsから）
  originating_house: HouseEnum;
  shugiin_url: string | null;
};

// Combined types for UI
export type BillWithStance = Bill & {
  mirai_stance?: MiraiStance;
};

export type BillTag = {
  id: string;
  label: string;
};

export type FeaturedTag = {
  id: string;
  label: string;
  priority: number;
};

export type BillWithContent = Bill & {
  bill_content?: BillContent;
  mirai_stance?: MiraiStance;
  tags: BillTag[];
  featured_tag?: FeaturedTag;
};

// タグごとにグループ化された議案
export type BillsByTag = {
  tag: BillTag & { description?: string; priority: number };
  bills: BillWithContent[];
};

// House display mapping
export const HOUSE_LABELS: Record<HouseEnum, string> = {
  HR: "衆議院",
  HC: "参議院",
};

// ステータスを日本語ラベルに変換する関数
export function getBillStatusLabel(
  status: BillStatusEnum,
  originatingHouse?: HouseEnum | null
): string {
  switch (status) {
    case "preparing":
      return "準備中";
    case "coming_soon":
      return "近日公開";
    case "introduced":
      return "提出済み";
    case "in_originating_house":
      if (originatingHouse) {
        return `${HOUSE_LABELS[originatingHouse]}審議中`;
      }
      return "審議中";
    case "in_receiving_house":
    case "in_other_house":
      if (originatingHouse) {
        const receivingHouse = originatingHouse === "HR" ? "HC" : "HR";
        return `${HOUSE_LABELS[receivingHouse]}審議中`;
      }
      return "審議中";
    case "enacted":
      return "成立";
    case "rejected":
      return "否決";
    case "withdrawn":
      return "撤回";
    case "continued":
      return "継続審議";
    default:
      return status;
  }
}

export const STANCE_LABELS: Record<StanceTypeEnum, string> = {
  for: "賛成",
  against: "反対",
  neutral: "中立",
  conditional_for: "条件付き賛成",
  conditional_against: "条件付き反対",
  considering: "検討中",
  continued_deliberation: "継続審査中",
};

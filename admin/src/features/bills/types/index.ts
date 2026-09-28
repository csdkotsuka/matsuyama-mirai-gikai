import type {
  Bill,
  BillStatusEnum as BillStatus,
  BillPublishStatus,
  HouseEnum as OriginatingHouse,
  BillContent,
} from "@mirai-gikai/firebase";

export type { Bill, BillStatus, BillPublishStatus, OriginatingHouse };

export type BillInsert = Omit<Bill, "id" | "created_at" | "updated_at">;
export type BillUpdate = Partial<BillInsert>;

export type BillWithContent = Bill & {
  bill_content?: BillContent;
};

// House display mapping
export const HOUSE_LABELS: Record<OriginatingHouse, string> = {
  HR: "衆議院",
  HC: "参議院",
};

// ステータスを日本語ラベルに変換する関数
export function getBillStatusLabel(
  status: BillStatus,
  originatingHouse?: OriginatingHouse | null
): string {
  switch (status) {
    case "preparing":
      return "準備中";
    case "coming_soon":
      return "近日公開";
    case "in_originating_house":
      if (originatingHouse) {
        return `${HOUSE_LABELS[originatingHouse]}審議中`;
      }
      return "審議中";
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

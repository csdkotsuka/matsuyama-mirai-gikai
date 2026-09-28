import "server-only";

import { getAdminFirestore } from "@mirai-gikai/firebase";
import type { LanguageModelUsage } from "ai";

import {
  calculateUsageCostUsd,
  roundCost,
  type SanitizedUsage,
  sanitizeUsage,
} from "@/lib/ai/calculate-ai-cost";

export type ChatUsageInsert = {
  user_id: string;
  session_id: string | null;
  prompt_name: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  occurred_at: string;
  metadata?: Record<string, any> | null;
};

type RecordChatUsageParams = {
  userId: string;
  sessionId?: string;
  promptName?: string;
  model: string;
  usage: LanguageModelUsage;
  occurredAt?: string;
  metadata?: Record<string, any> | null;
  costUsd?: number | null;
};

export async function recordChatUsage({
  userId,
  sessionId,
  promptName,
  model,
  usage,
  occurredAt,
  metadata,
  costUsd,
}: RecordChatUsageParams) {
  try {
    const db = getAdminFirestore();

    const sanitizedUsage = sanitizeUsage(usage ?? undefined);
    const costUsdNumber = resolveCostUsd(model, sanitizedUsage, costUsd);
    const payload: ChatUsageInsert = {
      user_id: userId,
      session_id: sessionId ?? null,
      prompt_name: promptName ?? null,
      model,
      input_tokens: sanitizedUsage.inputTokens,
      output_tokens: sanitizedUsage.outputTokens,
      total_tokens: sanitizedUsage.totalTokens,
      cost_usd: costUsdNumber,
      occurred_at: occurredAt ?? new Date().toISOString(),
      metadata: metadata ?? null,
    };

    await db.collection("chat_usage_events").add(payload);
  } catch (error: any) {
    throw new Error(`Failed to record chat usage: ${error?.message || error}`, {
      cause: error,
    });
  }
}

export async function getUsageCostUsd(
  userId: string,
  fromIso: string,
  toIso: string
): Promise<number> {
  try {
    const db = getAdminFirestore();

    const snapshot = await db
      .collection("chat_usage_events")
      .where("user_id", "==", userId)
      .where("occurred_at", ">=", fromIso)
      .where("occurred_at", "<", toIso)
      .get();

    return snapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      const val = Number(data.cost_usd);
      return acc + (Number.isFinite(val) ? val : 0);
    }, 0);
  } catch (error: any) {
    throw new Error(`Failed to fetch chat usage: ${error?.message || error}`, {
      cause: error,
    });
  }
}

function resolveCostUsd(
  model: string,
  usage: SanitizedUsage,
  costOverride?: number | null
): number {
  if (typeof costOverride === "number" && Number.isFinite(costOverride)) {
    return roundCost(costOverride);
  }

  if (usage.inputTokens > 0 || usage.outputTokens > 0) {
    try {
      return calculateUsageCostUsd(model, usage);
    } catch (error) {
      console.error("Failed to calculate usage cost:", error);
    }
  }

  return 0;
}

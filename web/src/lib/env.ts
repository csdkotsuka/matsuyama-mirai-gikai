/**
 * 環境変数の設定
 * アプリケーション全体で使用する環境変数を一元管理
 */

const chatDailyCostLimitUsdRaw = process.env.CHAT_DAILY_COST_LIMIT_USD || "0.5";
const chatDailyCostLimitUsd = Number(chatDailyCostLimitUsdRaw) || 0.5;

export const env = {
  webUrl: process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL || "http://localhost:3001",
  firebaseProjectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "miraigikai",
  revalidateSecret: process.env.REVALIDATE_SECRET,
  analytics: {
    gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  },
  langfuse: {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
    promptLabel: process.env.LANGFUSE_PROMPT_LABEL || "production",
  },
  chat: {
    dailyCostLimitUsd: chatDailyCostLimitUsd,
  },
  googleGenerativeAiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
} as const;

// 型定義
export type Env = typeof env;

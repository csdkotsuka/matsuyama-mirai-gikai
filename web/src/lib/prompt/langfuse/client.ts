import { Langfuse } from "langfuse";
import { env } from "@/lib/env";

let langfuseClient: Langfuse | null = null;

export function getLangfuseClient(): Langfuse | null {
  if (!langfuseClient) {
    const { publicKey, secretKey, baseUrl } = env.langfuse;

    if (!publicKey || !secretKey) {
      console.log("[Telemetry] Langfuse credentials not configured. Telemetry disabled.");
      return null;
    }

    langfuseClient = new Langfuse({
      publicKey,
      secretKey,
      baseUrl,
      release: process.env.VERCEL_ENV || "development",
    });
  }

  return langfuseClient;
}

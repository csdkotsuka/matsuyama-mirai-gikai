import type { PromptProvider } from "../interface/prompt-provider";
import type { CompiledPrompt, PromptVariables } from "../interface/types";

/**
 * Langfuseが利用できない場合のフォールバックプロンプトプロバイダー
 * 静的なプロンプトを返す
 */
export class FallbackPromptProvider implements PromptProvider {
    async getPrompt(
        name: string,
        variables?: PromptVariables
    ): Promise<CompiledPrompt> {
        // デフォルトのプロンプトを返す
        const defaultPrompts: Record<string, string> = {
            "chat-system": `あなたは地方議会の情報を提供するAIアシスタントです。
ユーザーの質問に対して、議会の会議録データベースから関連する情報を検索し、
正確で分かりやすい回答を提供してください。

回答の際は以下の点に注意してください：
- 検索結果に基づいて回答する
- 情報源を明示する
- 不明な点は推測せず、正直に「わかりません」と答える
- 専門用語は分かりやすく説明する`,
        };

        const content = defaultPrompts[name] || `System prompt for ${name}`;

        return {
            content,
            metadata: JSON.stringify({
                name,
                version: "fallback",
                type: "text",
            }),
        };
    }
}

"use server";

import { randomBytes } from "node:crypto";
import { getAdminFirestore } from "@mirai-gikai/firebase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { env } from "@/lib/env";

interface GeneratePreviewUrlResult {
  success: boolean;
  url?: string;
  token?: string;
  expiresAt?: string;
  error?: string;
}

interface ExistingToken {
  token: string;
  expires_at: string;
}

export async function generatePreviewUrl(
  billId: string
): Promise<GeneratePreviewUrlResult> {
  await requireAdmin();

  try {
    const existingToken = await _getExistingValidToken(billId);

    if (existingToken) {
      return {
        success: true,
        url: _buildPreviewUrl(billId, existingToken.token),
        token: existingToken.token,
        expiresAt: existingToken.expires_at,
      };
    }

    const token = _generateToken();
    const expiresAt = _calculateExpiry();

    await _saveToken(billId, token, expiresAt);

    return {
      success: true,
      url: _buildPreviewUrl(billId, token),
      token,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Error generating preview URL:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
    };
  }
}

// 既存の有効なトークンを取得
async function _getExistingValidToken(
  billId: string
): Promise<ExistingToken | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("preview_tokens")
    .where("bill_id", "==", billId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  const expiresAt = new Date(data.expires_at);
  const now = new Date();

  if (expiresAt > now) {
    return { token: data.token, expires_at: data.expires_at };
  }

  // 期限切れの場合は削除
  await doc.ref.delete();
  return null;
}

// 新しいトークンを生成
function _generateToken(): string {
  return randomBytes(32).toString("hex");
}

// 有効期限を計算（30日後）
function _calculateExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  return expiresAt;
}

// トークンをデータベースに保存
async function _saveToken(billId: string, token: string, expiresAt: Date) {
  const db = getAdminFirestore();
  await db.collection("preview_tokens").add({
    bill_id: billId,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
    created_by: "admin",
  });
}

// プレビューURLを構築
function _buildPreviewUrl(billId: string, token: string): string {
  return `${env.webUrl}/preview/bills/${billId}?token=${token}`;
}

// トークンの検証
export async function _validatePreviewToken(
  billId: string,
  token: string
): Promise<boolean> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection("preview_tokens")
      .where("bill_id", "==", billId)
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return false;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const expiresAt = new Date(data.expires_at);
    return expiresAt > new Date();
  } catch (error) {
    console.error("Error validating preview token:", error);
    return false;
  }
}

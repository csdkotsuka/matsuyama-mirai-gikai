import { getFirebaseClient } from "@mirai-gikai/firebase/client";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export interface UploadResult {
  url?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * サムネイル画像をFirebase Storageにアップロード
 */
export async function uploadThumbnail(
  file: File,
  billId?: string,
  storagePrefix?: string
): Promise<UploadResult> {
  const { storage } = getFirebaseClient();

  // ファイル形式チェック
  if (!file.type.startsWith("image/")) {
    return { error: "画像ファイルを選択してください" };
  }

  // ファイルサイズチェック (5MB以下)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "ファイルサイズは5MB以下にしてください" };
  }

  try {
    // 新しいファイル名を生成
    const fileExt = file.name.split(".").pop();
    const prefix = storagePrefix ? `${storagePrefix}_` : "";
    const fileName = `thumbnails/${prefix}${billId || "new"}_${Date.now()}.${fileExt}`;

    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);

    return { url: downloadUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "アップロードに失敗しました" };
  }
}

/**
 * サムネイル画像をFirebase Storageから削除
 */
export async function deleteThumbnail(url: string): Promise<DeleteResult> {
  const { storage } = getFirebaseClient();

  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "削除に失敗しました" };
  }
}

"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

const COOKIE_NAME = "anonymous_user_id";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * 匿名ユーザーIDをCookie/LocalStorageで永続化して取得するフック
 */
export function useAnonymousSupabaseUser() {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      let id = getCookie(COOKIE_NAME);
      if (!id && typeof window !== "undefined") {
        id = localStorage.getItem(COOKIE_NAME);
      }

      if (!id) {
        id = `anon_${nanoid(21)}`;
      }

      setCookie(COOKIE_NAME, id);
      if (typeof window !== "undefined") {
        localStorage.setItem(COOKIE_NAME, id);
      }

      setUserId(id);
    } catch (err) {
      console.error("Error setting anonymous user:", err);
      const fallback = `anon_${nanoid(21)}`;
      setUserId(fallback);
    }
  }, []);

  return userId;
}

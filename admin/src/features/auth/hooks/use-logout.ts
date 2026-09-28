import { useState } from "react";
import { useRouter } from "next/navigation";

import { signOut } from "../lib/auth-client";

export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout fails on server, redirect to login
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading,
  };
}

import "server-only";

import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export async function getChatSupabaseUser() {
  const cookieStore = await cookies();
  let userId = cookieStore.get("anonymous_user_id")?.value;

  if (!userId) {
    userId = `anon_${nanoid(21)}`;
  }

  return {
    data: {
      user: {
        id: userId,
      },
    },
    error: null,
  };
}

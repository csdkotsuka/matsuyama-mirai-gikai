import { getAdminAuth } from "@mirai-gikai/firebase";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    // Verify admin role
    const isAdmin =
      decodedToken.admin === true ||
      (Array.isArray(decodedToken.roles) &&
        decodedToken.roles.includes("admin"));

    if (!isAdmin) {
      return NextResponse.json(
        { error: "管理者権限がありません。" },
        { status: 403 }
      );
    }

    // 5 days session
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();
    cookieStore.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("__session");
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to clear session" },
      { status: 500 }
    );
  }
}

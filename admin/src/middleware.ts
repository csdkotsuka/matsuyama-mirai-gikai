import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // APIルートはミドルウェアをスキップ
  if (isApiRoute) {
    return NextResponse.next();
  }

  // ログインページへのアクセスで、すでにセッションCookieがある場合
  if (isLoginPage) {
    if (sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/bills";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 保護されたルートへのアクセスで、セッションCookieがない場合
  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

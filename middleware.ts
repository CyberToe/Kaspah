import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GUEST_COOKIES = ["kaspah_guest", "kaspah_guest_country"];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const prefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";
  if (prefetch || request.nextUrl.pathname.startsWith("/guest")) {
    return response;
  }
  for (const name of GUEST_COOKIES) {
    if (request.cookies.has(name)) {
      response.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|kaspah.jpg|icon.svg).*)"],
};

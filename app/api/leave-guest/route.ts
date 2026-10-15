import { NextResponse } from "next/server";
import { COOKIE_GUEST, COOKIE_GUEST_BENCH, COOKIE_GUEST_COUNTRY } from "@/lib/constants";

const GUEST_COOKIES = [COOKIE_GUEST, COOKIE_GUEST_COUNTRY, COOKIE_GUEST_BENCH];

export async function POST() {
  const response = NextResponse.json({ ok: true });
  for (const name of GUEST_COOKIES) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return response;
}

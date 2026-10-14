import { NextResponse } from "next/server";

const GUEST_COOKIES = ["kaspah_guest", "kaspah_guest_country"];

export async function POST() {
  const response = NextResponse.json({ ok: true });
  for (const name of GUEST_COOKIES) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return response;
}

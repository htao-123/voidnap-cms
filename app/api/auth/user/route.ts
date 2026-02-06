import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("voidnap_session");

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    // Check if session has expired
    if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: sessionData.user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

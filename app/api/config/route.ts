import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("voidnap_session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    // Check if session has expired
    if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Get config from cookie if exists
    const configCookie = cookieStore.get("voidnap_config");
    if (configCookie) {
      return NextResponse.json(JSON.parse(configCookie.value));
    }

    // No config set yet
    return NextResponse.json({
      repo: null,
      branch: "main",
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("voidnap_session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { repo, branch } = body;

    if (!repo) {
      return NextResponse.json({ error: "Repository is required" }, { status: 400 });
    }

    // Store config in session (in production, use database)
    const config = { repo, branch: branch || "main" };

    // For now, we'll use a cookie to store config
    const response = NextResponse.json({ ...config, success: true });

    response.cookies.set("voidnap_config", JSON.stringify(config), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

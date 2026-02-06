import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  // Public endpoint - allow reading config without authentication
  // This allows frontend to load and display public content
  const configCookie = cookieStore.get("voidnap_config");
  if (configCookie) {
    try {
      return NextResponse.json(JSON.parse(configCookie.value));
    } catch {
      // Invalid config cookie, try env var
    }
  }

  // Fallback to environment variable for public access
  // This allows the site to display content without requiring login
  const publicRepo = process.env.PUBLIC_GITHUB_REPO;
  const publicBranch = process.env.PUBLIC_GITHUB_BRANCH || "main";

  if (publicRepo) {
    return NextResponse.json({
      repo: publicRepo,
      branch: publicBranch,
    });
  }

  // No config set yet - return empty config
  return NextResponse.json({
    repo: null,
    branch: "main",
  });
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

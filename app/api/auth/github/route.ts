import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";

  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: "GitHub Client ID not configured" },
      { status: 500 }
    );
  }

  // Generate a random state parameter for security
  const state = Buffer.from(Math.random().toString()).toString("base64");

  // Construct the GitHub OAuth URL using the request's origin
  const origin = request.headers.get("x-forwarded-host")
    ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host")}`
    : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`;

  const redirectUri = `${origin}/api/auth/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;

  // Redirect to GitHub
  return NextResponse.redirect(githubAuthUrl);
}

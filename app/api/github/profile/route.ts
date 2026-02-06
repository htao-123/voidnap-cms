import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const configCookie = cookieStore.get("voidnap_config");

  if (!configCookie) {
    return NextResponse.json({ profile: null });
  }

  try {
    const config = JSON.parse(configCookie.value);
    const [owner, repoName] = config.repo.split("/");

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ profile: null });
    }

    // Fetch profile from GitHub repository
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/data/profile.md?ref=${config.branch}`,
      {
        headers: {
          Accept: "application/vnd.github.raw",
          "User-Agent": "Voidnap-CMS",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ profile: null });
    }

    const content = await response.text();
    const frontmatter = parseFrontmatter(content);

    const profile = {
      name: frontmatter.name || "User",
      title: frontmatter.title || "",
      bio: frontmatter.bio || "",
      email: frontmatter.email || "",
      avatarUrl: frontmatter.avatarUrl || "",
      socials: {
        github: frontmatter.github || "",
        twitter: frontmatter.twitter || "",
        linkedin: frontmatter.linkedin || "",
      },
      resume: {
        experience: frontmatter.experience || [],
        education: frontmatter.education || [],
        skills: frontmatter.skills || [],
      },
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ profile: null });
  }
}

function parseFrontmatter(content: string): Record<string, any> {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const frontmatter: Record<string, any> = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value: any = line.slice(colonIndex + 1).trim();

      // Strip quotes from string values
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (value.startsWith("[") && value.endsWith("]")) {
        value = value.slice(1, -1).split(",").map((v: string) => v.trim().replace(/"/g, ""));
      } else if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      }

      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper function to convert content to base64
function toBase64(content: string): string {
  return Buffer.from(content).toString("base64");
}

// Helper to generate frontmatter
function generateFrontmatter(data: Record<string, any>): string {
  let frontmatter = "---\n";
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      frontmatter += `${key}: [${value.map(v => `"${v}"`).join(", ")}]\n`;
    } else if (typeof value === "boolean") {
      frontmatter += `${key}: ${value}\n`;
    } else if (value && value !== "") {
      frontmatter += `${key}: "${value}"\n`;
    }
  }
  frontmatter += "---\n";
  return frontmatter;
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("voidnap_session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const configCookie = cookieStore.get("voidnap_config");
    if (!configCookie) {
      return NextResponse.json({ error: "Repository not configured" }, { status: 400 });
    }

    const config = JSON.parse(configCookie.value);
    const body = await request.json();
    const { type, id, content } = body; // type: 'project' | 'blog' | 'profile'

    if (!type || !id || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const [owner, repoName] = config.repo.split("/");

    // Determine file path based on type and collection
    let filePath: string;
    let fileName: string;

    if (type === "profile") {
      filePath = `data/profile.md`;
      fileName = "profile.md";
    } else if (type === "project") {
      const collection = content.collection || null;
      fileName = `${id}.md`;
      filePath = collection ? `data/projects/${collection}/${fileName}` : `data/projects/${fileName}`;
    } else if (type === "blog") {
      const collection = content.collection || null;
      fileName = `${id}.md`;
      filePath = collection ? `data/blogs/${collection}/${fileName}` : `data/blogs/${fileName}`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Generate markdown content with frontmatter
    let fileContent = "";

    if (type === "profile") {
      fileContent = generateFrontmatter({
        name: content.name,
        title: content.title,
        bio: content.bio,
        email: content.email,
        avatarUrl: content.avatarUrl,
        github: content.socials?.github,
        twitter: content.socials?.twitter,
        linkedin: content.socials?.linkedin,
        experience: content.resume?.experience || [],
        education: content.resume?.education || [],
        skills: content.resume?.skills || [],
      });
      fileContent += "\n"; // Empty content section after frontmatter
    } else if (type === "project") {
      fileContent = generateFrontmatter({
        title: content.title,
        description: content.description,
        imageUrl: content.imageUrl,
        tags: content.tags || [],
        link: content.link,
        github: content.github,
        createdAt: content.createdAt,
      });
      fileContent += `\n${content.content || ""}`;
    } else if (type === "blog") {
      fileContent = generateFrontmatter({
        title: content.title,
        excerpt: content.excerpt,
        coverImage: content.coverImage,
        tags: content.tags || [],
        publishedAt: content.publishedAt,
        status: content.status,
      });
      fileContent += `\n${content.content || ""}`;
    }

    // Check if file exists first
    const checkResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(filePath)}?ref=${config.branch}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Voidnap-CMS",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    let sha: string | undefined;

    if (checkResponse.ok) {
      const fileData = await checkResponse.json();
      sha = fileData.sha;
    }

    // Create or update file
    const method = sha ? "PUT" : "PUT"; // GitHub API uses PUT for both create and update
    const bodyData = sha
      ? {
          message: `Update ${type}: ${content.title || id}`,
          content: toBase64(fileContent),
          sha,
          branch: config.branch,
        }
      : {
          message: `Create ${type}: ${content.title || id}`,
          content: toBase64(fileContent),
          branch: config.branch,
        };

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(filePath)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Voidnap-CMS",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", response.status, errorText);
      let errorMsg = "Failed to push to GitHub";
      try {
        const error = JSON.parse(errorText);
        if (error.message) errorMsg = error.message;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, content: result });
  } catch (error) {
    console.error("Error pushing to GitHub:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE endpoint for removing files
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("voidnap_session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);

    if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const configCookie = cookieStore.get("voidnap_config");
    if (!configCookie) {
      return NextResponse.json({ error: "Repository not configured" }, { status: 400 });
    }

    const config = JSON.parse(configCookie.value);
    const body = await request.json();
    const { type, id, collection } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const [owner, repoName] = config.repo.split("/");

    // Determine file path
    let filePath: string;
    if (type === "project") {
      filePath = collection ? `data/projects/${collection}/${id}.md` : `data/projects/${id}.md`;
    } else if (type === "blog") {
      filePath = collection ? `data/blogs/${collection}/${id}.md` : `data/blogs/${id}.md`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Get file SHA first
    const checkResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(filePath)}?ref=${config.branch}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Voidnap-CMS",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!checkResponse.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileData = await checkResponse.json();
    const sha = fileData.sha;

    // Delete file
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(filePath)}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Voidnap-CMS",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Delete ${type}: ${id}`,
          sha,
          branch: config.branch,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", response.status, errorText);
      return NextResponse.json({ error: "Failed to delete from GitHub" }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting from GitHub:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

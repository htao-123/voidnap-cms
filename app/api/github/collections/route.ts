import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const configCookie = cookieStore.get("voidnap_config");

  // Get config from cookie or environment variable
  let config;
  if (configCookie) {
    try {
      config = JSON.parse(configCookie.value);
    } catch {
      // Invalid cookie, fallback to env var
    }
  }

  // Fallback to environment variable for public access
  if (!config) {
    const publicRepo = process.env.PUBLIC_GITHUB_REPO;
    const publicBranch = process.env.PUBLIC_GITHUB_BRANCH || "main";
    if (publicRepo) {
      config = { repo: publicRepo, branch: publicBranch };
    } else {
      return NextResponse.json({ collections: [] });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blogs"; // 'blogs' or 'projects'

    const [owner, repoName] = config.repo.split("/");

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ collections: [] });
    }

    // Fetch directory contents
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/data/${type}?ref=${config.branch}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Voidnap-CMS",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ collections: [] });
      }
      return NextResponse.json({ error: "Failed to fetch collections" }, { status: response.status });
    }

    const files = await response.json();
    const collections: Array<{ id: string; name: string; description?: string }> = [];

    // Only directories are collections
    for (const file of files) {
      if (file.type === "dir") {
        // Try to fetch .collection.md file for metadata
        let collectionName = file.name;
        let description: string | undefined;

        try {
          const metaResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/contents/data/${type}/${file.name}/.collection.md?ref=${config.branch}`,
            {
              headers: {
                Accept: "application/vnd.github.raw",
                "User-Agent": "Voidnap-CMS",
                Authorization: `Bearer ${GITHUB_TOKEN}`,
              },
            }
          );

          if (metaResponse.ok) {
            const content = await metaResponse.text();
            const frontmatter = parseFrontmatter(content);
            collectionName = frontmatter.name || file.name;
            description = frontmatter.description;
          }
        } catch {
          // Ignore error, use directory name
        }

        collections.push({
          id: file.name,
          name: collectionName,
          description,
        });
      }
    }

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST to create a new collection
export async function POST(request: Request) {
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
    const { type, id, name, description } = body; // type: 'blogs' | 'projects'

    if (!type || !id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const [owner, repoName] = config.repo.split("/");

    // Function to convert content to base64
    function toBase64(content: string): string {
      return Buffer.from(content).toString("base64");
    }

    // Create .collection.md file content
    const fileContent = `---
name: "${name}"
description: "${description || ""}"
---
`;

    // First, create the directory by creating a .collection.md file in it
    const filePath = `data/${type}/${id}/.collection.md`;

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
        body: JSON.stringify({
          message: `Create collection: ${name}`,
          content: toBase64(fileContent),
          branch: config.branch,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", response.status, errorText);
      return NextResponse.json({ error: "Failed to create collection" }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE to delete a collection and all its contents
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blogs"; // 'blogs' or 'projects'
    const collectionId = searchParams.get("id");

    if (!collectionId) {
      return NextResponse.json({ error: "Missing collection id" }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const [owner, repoName] = config.repo.split("/");

    // First, get all files in the collection directory
    const listResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/data/${type}/${collectionId}?ref=${config.branch}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Voidnap-CMS",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!listResponse.ok) {
      if (listResponse.status === 404) {
        return NextResponse.json({ error: "Collection not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to list collection files" }, { status: listResponse.status });
    }

    const files = await listResponse.json();

    // Delete all files in the collection
    const deletePromises = files.map(async (file: any) => {
      const deleteResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Voidnap-CMS",
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Delete collection: ${collectionId}`,
            sha: file.sha,
            branch: config.branch,
          }),
        }
      );

      if (!deleteResponse.ok) {
        console.error(`Failed to delete ${file.path}:`, await deleteResponse.text());
      }
      return deleteResponse.ok;
    });

    await Promise.all(deletePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
        // Only convert to boolean for known boolean keys
        if (key === "published" || key === "private" || key === "featured") {
          value = true;
        }
      } else if (value === "false") {
        // Only convert to boolean for known boolean keys
        if (key === "published" || key === "private" || key === "featured") {
          value = false;
        }
      }

      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

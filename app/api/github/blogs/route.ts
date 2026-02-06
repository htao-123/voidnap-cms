import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
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
      return NextResponse.json({ blogs: [] });
    }
  }

  try {
    const [owner, repoName] = config.repo.split("/");

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    // Fetch blogs from GitHub repository
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/data/blogs?ref=${config.branch}`,
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
        return NextResponse.json({ blogs: [] });
      }
      return NextResponse.json({ error: "Failed to fetch blogs" }, { status: response.status });
    }

    const files = await response.json();
    const blogs = [];
    const blogIdsInCollections = new Set<string>();

    // First, fetch files from collection directories
    for (const file of files) {
      if (file.type === "dir") {
        const dirResponse = await fetch(file.url, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Voidnap-CMS",
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
        });

        if (dirResponse.ok) {
          const dirFiles = await dirResponse.json();
          for (const dirFile of dirFiles) {
            if (dirFile.name.endsWith(".md") && dirFile.name !== ".collection.md") {
              const blogId = dirFile.name.replace(".md", "");
              blogIdsInCollections.add(blogId);
              const blog = await fetchBlogContent(dirFile, file.name);
              if (blog) blogs.push(blog);
            }
          }
        }
      }
    }

    // Then, fetch files from root directory, but skip if already in a collection
    for (const file of files) {
      if (file.name.endsWith(".md")) {
        const blogId = file.name.replace(".md", "");
        // Skip if this blog is already in a collection
        if (blogIdsInCollections.has(blogId)) {
          continue;
        }
        const blog = await fetchBlogContent(file);
        if (blog) blogs.push(blog);
      }
    }

    // Sort by published date
    blogs.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function fetchBlogContent(file: any, collection?: string) {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const contentResponse = await fetch(file.url, {
      headers: {
        Accept: "application/vnd.github.raw",
        "User-Agent": "Voidnap-CMS",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    if (!contentResponse.ok) return null;

    const content = await contentResponse.text();
    const { frontmatter, body } = parseFrontmatter(content);

    return {
      id: file.name.replace(".md", ""),
      title: frontmatter.title || file.name.replace(".md", ""),
      excerpt: frontmatter.excerpt || "",
      content: body || content,
      coverImage: frontmatter.coverImage || "",
      tags: frontmatter.tags || [],
      publishedAt: frontmatter.publishedAt || new Date(file.created_at).toISOString(),
      status: frontmatter.status || "published",
      collection: collection || null,
    };
  } catch {
    return null;
  }
}

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
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

  return { frontmatter, body: match[2] };
}

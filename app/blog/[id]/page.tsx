"use client";

import { useData } from "@/lib/data-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogDetailPage() {
  const { blogs } = useData();
  const params = useParams();
  const blog = blogs.find((b) => b.id === params.id);

  if (!blog) {
    return (
      <div className="container px-4 py-12 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold font-display mb-4">文章未找到</h1>
          <p className="text-muted-foreground mb-8">
            抱歉，您查找的文章不存在。
          </p>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" /> 返回博客
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-8" asChild>
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" /> 返回博客
          </Link>
        </Button>

        <article>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(blog.publishedAt).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <div className="flex gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">
            {blog.title}
          </h1>

          {blog.coverImage && (
            <div className="aspect-video rounded-lg overflow-hidden mb-8">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {blog.excerpt}
            </p>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

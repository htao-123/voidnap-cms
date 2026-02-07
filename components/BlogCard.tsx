"use client";

import type { BlogPost } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BlogCardProps {
  blog: BlogPost;
  priority?: boolean; // For above-the-fold images
}

export function BlogCard({ blog, priority }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${blog.id}`}
      className="block h-full group"
      aria-label={`Read article: ${blog.title}`}
    >
      <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 cursor-pointer overflow-hidden">
        <CardHeader className="p-6 space-y-4">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="aspect-[16/10] rounded-lg overflow-hidden bg-muted/30">
              <img
                src={blog.coverImage}
                alt={blog.title}
                loading={priority ? "eager" : "lazy"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={blog.publishedAt}>
                {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </span>
            {blog.tags.length > 0 && (
              <div className="flex gap-1.5">
                {blog.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] h-5 px-2 font-normal hover:bg-secondary/70 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold font-display leading-snug group-hover:text-primary transition-colors duration-200">
            {blog.title}
          </h3>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          {/* Excerpt */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {blog.excerpt}
          </p>

          {/* Read more link */}
          <div className="flex items-center text-primary text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-200">
            <span>Read article</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

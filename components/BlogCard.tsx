"use client";

import type { BlogPost } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import Link from "next/link";

export function BlogCard({ blog }: { blog: BlogPost }) {
  return (
    <Link href={`/blog/${blog.id}`} className="block h-full">
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-none shadow-none hover:shadow-sm">
        <CardHeader className="p-0 mb-4">
          {blog.coverImage && (
            <div className="aspect-[2/1] rounded-md overflow-hidden mb-4">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-1">
              {blog.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] h-5 px-1.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-muted-foreground line-clamp-3">{blog.excerpt}</p>
          <div className="mt-4 text-primary text-sm font-medium">
            Read article →
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

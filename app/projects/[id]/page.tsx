"use client";

import { useData } from "@/lib/data-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ProjectDetailPage() {
  const { projects } = useData();
  const params = useParams();
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    return (
      <div className="container px-4 py-12 min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold font-display mb-4">项目未找到</h1>
          <p className="text-muted-foreground mb-8">
            抱歉，您查找的项目不存在。
          </p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" /> 返回项目
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-8" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" /> 返回项目
          </Link>
        </Button>

        <article>
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(project.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <div className="flex gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              {project.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {project.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {project.link && (
                <Button asChild>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> 查看演示
                  </a>
                </Button>
              )}
              {project.github && (
                <Button variant="outline" asChild>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-2" /> 源代码
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {project.imageUrl && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8 border">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

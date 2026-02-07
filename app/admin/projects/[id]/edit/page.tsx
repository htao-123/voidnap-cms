"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useData } from "@/lib/data-context";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { ImageUpload } from "@/components/editor/ImageUpload";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { projects, pushProject, syncProjects, isPushing, projectCollections, fetchCollections } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [collections, setCollections] = useState(projectCollections);

  useEffect(() => {
    const found = projects.find(p => p.id === params.id);
    if (found) {
      setProject(found);
      setFormData(found);
    } else {
      router.push("/admin?tab=projects");
    }
    fetchCollections("projects").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, projects, router]);

  const handleSave = async () => {
    if (!formData.title || !project) {
      alert("标题不能为空");
      return;
    }

    setIsSaving(true);
    try {
      // Ensure createdAt is preserved from original project
      const updatedProject: Project = {
        ...project,
        ...formData,
        id: project.id,
        createdAt: project.createdAt,
      };

      // Push to GitHub directly, passing old collection for cleanup
      const pushed = await pushProject(updatedProject, project.collection);
      if (pushed) {
        // Sync from GitHub to get the latest data
        await syncProjects();
        router.push("/admin?tab=projects");
      } else {
        alert("推送到 GitHub 失败，请检查网络连接");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin?tab=projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">编辑项目</h1>
              <p className="text-sm text-muted-foreground">{project.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-9xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
            <CardDescription>修改项目详细信息，支持 Markdown 格式</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label>标题 <span className="text-destructive">*</span></Label>
              <Input
                placeholder="输入项目名称"
                value={formData.title || ""}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label>简介</Label>
              <Textarea
                placeholder="简短描述项目（一两句话）"
                value={formData.description || ""}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label>详细内容（Markdown）</Label>
              <MarkdownEditor
                value={formData.content || ""}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="支持 Markdown 语法..."
              />
            </div>

            <div className="grid gap-2">
              <ImageUpload
                value={formData.imageUrl || ""}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                type="projects"
                aspectRatio="16:10"
              />
            </div>

            <div className="grid gap-2">
              <Label>技术标签</Label>
              <Input
                placeholder="React, TypeScript, ..."
                value={formData.tags?.join(", ") || ""}
                onChange={e => setFormData({...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Demo 链接</Label>
                <Input
                  placeholder="https://demo.example.com"
                  value={formData.link || ""}
                  onChange={e => setFormData({...formData, link: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>GitHub 链接</Label>
                <Input
                  placeholder="https://github.com/..."
                  value={formData.github || ""}
                  onChange={e => setFormData({...formData, github: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>合集</Label>
              <Select
                value={formData.collection || ""}
                onValueChange={(value) => setFormData({ ...formData, collection: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择合集（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无合集</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push("/admin?tab=projects")}
              >
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isPushing} className="gap-2">
                {isSaving || isPushing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPushing ? "推送中..." : "保存中..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    保存更改
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

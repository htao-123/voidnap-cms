"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, FileEdit, Github } from "lucide-react";
import Link from "next/link";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { GithubRepoImporter } from "@/components/admin/GithubRepoImporter";

export default function NewProjectPage() {
  const router = useRouter();
  const { pushProject, syncProjects, isPushing, projectCollections, fetchCollections, createCollection } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [collections, setCollections] = useState(projectCollections);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionId, setNewCollectionId] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "github">("manual");

  useEffect(() => {
    fetchCollections("projects").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    description: "",
    content: "",
    imageUrl: "",
    tags: [],
    link: "",
    github: "",
    collection: null
  });

  const handleSave = async () => {
    if (!formData.title) {
      alert("标题不能为空");
      return;
    }

    setIsSaving(true);
    try {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        createdAt: new Date().toISOString(),
        collection: formData.collection || null,
        title: formData.title || "",
        description: formData.description || "",
        content: formData.content || "",
        imageUrl: formData.imageUrl || "",
        tags: formData.tags || [],
        link: formData.link,
        github: formData.github,
      };

      // Push to GitHub directly
      const pushed = await pushProject(newProject);
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

  const handleCreateCollection = async () => {
    if (!newCollectionId || !newCollectionName) {
      alert("请填写合集ID和名称");
      return;
    }
    setIsCreatingCollection(true);
    try {
      const success = await createCollection("projects", newCollectionId, newCollectionName);
      if (success) {
        const updated = await fetchCollections("projects");
        setCollections(updated);
        setFormData({ ...formData, collection: newCollectionId });
        setShowNewCollection(false);
        setNewCollectionId("");
        setNewCollectionName("");
      } else {
        alert("创建合集失败");
      }
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleGitHubImport = (project: Project) => {
    // Pre-fill form with imported project data
    setFormData({
      ...project,
      collection: formData.collection, // preserve selected collection
    });
    // Switch to manual tab for editing
    setActiveTab("manual");
  };

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
              <h1 className="text-xl font-bold">新建项目</h1>
              <p className="text-sm text-muted-foreground">创建一个新的项目展示</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-9xl py-8">
        {/* Tabs for Manual Creation and GitHub Import */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "github")} className="mb-6">
          <TabsList className="w-fit">
            <TabsTrigger value="manual" className="gap-2">
              <FileEdit className="w-4 h-4" />
              手动创建
            </TabsTrigger>
            <TabsTrigger value="github" className="gap-2">
              <Github className="w-4 h-4" />
              从 GitHub 导入
            </TabsTrigger>
          </TabsList>

          {/* Manual Creation Tab */}
          <TabsContent value="manual" className="animate-in fade-in-50 slide-in-from-bottom-2">
            <Card>
              <CardHeader>
                <CardTitle>项目信息</CardTitle>
                <CardDescription>填写项目详细信息，支持 Markdown 格式</CardDescription>
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
                  <div className="flex gap-2">
                    <Select
                      value={formData.collection || ""}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setShowNewCollection(true);
                        } else {
                          setFormData({ ...formData, collection: value || null });
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="选择合集（可选）" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">无合集</SelectItem>
                        {collections.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ 新建合集</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {showNewCollection && (
                    <div className="mt-2 p-3 border rounded-lg bg-muted/50 space-y-2">
                      <Input
                        placeholder="合集ID（英文，如：web）"
                        value={newCollectionId}
                        onChange={(e) => setNewCollectionId(e.target.value)}
                      />
                      <Input
                        placeholder="合集名称（如：Web 项目）"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCreateCollection}
                          disabled={isCreatingCollection || isPushing}
                        >
                          {isCreatingCollection ? "创建中..." : "创建"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowNewCollection(false)}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  )}
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
                        保存并推送
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GitHub Import Tab */}
          <TabsContent value="github" className="animate-in fade-in-50 slide-in-from-bottom-2">
            <Card>
              <CardHeader>
                <CardTitle>从 GitHub 导入项目</CardTitle>
                <CardDescription>
                  从你的 GitHub 仓库中快速导入项目，自动提取 README、技术栈等信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GithubRepoImporter onImport={handleGitHubImport} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

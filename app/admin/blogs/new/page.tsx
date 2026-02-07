"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import type { BlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { ImageUpload } from "@/components/editor/ImageUpload";

export default function NewBlogPage() {
  const router = useRouter();
  const { pushBlog, syncBlogs, isPushing, blogCollections, fetchCollections, createCollection } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [collections, setCollections] = useState(blogCollections);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionId, setNewCollectionId] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  useEffect(() => {
    fetchCollections("blogs").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: [],
    status: "published",
    collection: null
  });

  const handleSave = async () => {
    if (!formData.title) {
      alert("标题不能为空");
      return;
    }

    setIsSaving(true);
    try {
      const newBlog: BlogPost = {
        id: `blog-${Date.now()}`,
        publishedAt: new Date().toISOString(),
        collection: formData.collection || null,
        title: formData.title || "",
        excerpt: formData.excerpt || "",
        content: formData.content || "",
        coverImage: formData.coverImage || "",
        tags: formData.tags || [],
        status: formData.status || "published",
      };

      // Push to GitHub directly
      const pushed = await pushBlog(newBlog);
      if (pushed) {
        // Sync from GitHub to get the latest data
        await syncBlogs();
        router.push("/admin?tab=blog");
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
      const success = await createCollection("blogs", newCollectionId, newCollectionName);
      if (success) {
        const updated = await fetchCollections("blogs");
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

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin?tab=blog">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">新建博客</h1>
              <p className="text-sm text-muted-foreground">创建一篇新的博客文章</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-9xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>文章信息</CardTitle>
            <CardDescription>填写博客文章详细信息，支持 Markdown 格式</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label>标题 <span className="text-destructive">*</span></Label>
              <Input
                placeholder="输入文章标题"
                value={formData.title || ""}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label>摘要</Label>
              <Textarea
                placeholder="简短描述文章内容（用于列表展示）"
                value={formData.excerpt || ""}
                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label>文章内容（Markdown）</Label>
              <MarkdownEditor
                value={formData.content || ""}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="支持 Markdown 语法..."
              />
            </div>

            <div className="grid gap-2">
              <ImageUpload
                value={formData.coverImage || ""}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                type="blogs"
                aspectRatio="16:10"
              />
            </div>

            <div className="grid gap-2">
              <Label>标签</Label>
              <Input
                placeholder="React, Next.js, ..."
                value={formData.tags?.join(", ") || ""}
                onChange={e => setFormData({...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
              />
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
                    placeholder="合集ID（英文，如：tech）"
                    value={newCollectionId}
                    onChange={(e) => setNewCollectionId(e.target.value)}
                  />
                  <Input
                    placeholder="合集名称（如：技术文章）"
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

            <div className="grid gap-2">
              <Label>状态</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "published"}
                    onChange={() => setFormData({...formData, status: "published"})}
                  />
                  <span>已发布</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "draft"}
                    onChange={() => setFormData({...formData, status: "draft"})}
                  />
                  <span>草稿</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push("/admin?tab=blog")}
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
      </div>
    </div>
  );
}

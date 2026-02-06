"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useData } from "@/lib/data-context";
import type { BlogPost } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { blogs, pushBlog, syncBlogs, isPushing, blogCollections, fetchCollections } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({});
  const [collections, setCollections] = useState(blogCollections);

  useEffect(() => {
    const found = blogs.find(b => b.id === params.id);
    if (found) {
      setBlog(found);
      setFormData(found);
    } else {
      router.push("/admin?tab=blog");
    }
    fetchCollections("blogs").then(setCollections);
  }, [params.id, blogs, router]);

  const handleSave = async () => {
    if (!formData.title || !blog) {
      alert("标题不能为空");
      return;
    }

    setIsSaving(true);
    try {
      // Ensure collection is preserved from original blog
      const updatedBlog: BlogPost = {
        ...blog,
        ...formData,
        id: blog.id,
        collection: blog.collection,
        publishedAt: blog.publishedAt,
      };

      // Push to GitHub directly
      const pushed = await pushBlog(updatedBlog);
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

  if (!blog) {
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
            <Link href="/admin?tab=blog">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">编辑博客</h1>
              <p className="text-sm text-muted-foreground">{blog.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-3xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>文章信息</CardTitle>
            <CardDescription>修改博客文章详细信息，支持 Markdown 格式</CardDescription>
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
              <Textarea
                className="font-mono text-sm min-h-[400px]"
                placeholder="支持 Markdown 语法..."
                value={formData.content || ""}
                onChange={e => setFormData({...formData, content: e.target.value})}
                rows={15}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>封面图片 URL</Label>
                <Input
                  placeholder="https://..."
                  value={formData.coverImage || ""}
                  onChange={e => setFormData({...formData, coverImage: e.target.value})}
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

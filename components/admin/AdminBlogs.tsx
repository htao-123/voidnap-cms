"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, FileText, Folder, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminBlogs() {
  const {
    blogs,
    deleteBlog,
    blogCollections,
    fetchCollections,
    deleteCollection,
    createCollection,
    isPushing
  } = useData();

  const [collections, setCollections] = useState(blogCollections);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  useEffect(() => {
    fetchCollections("blogs").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with context when collections change
  useEffect(() => {
    setCollections(blogCollections);
  }, [blogCollections]);

  // Filter logic
  const filteredBlogs = useMemo(() => {
    let result = blogs;
    if (selectedCollection !== "all") {
      result = blogs.filter(b => b.collection === selectedCollection);
    }
    return result.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
  }, [blogs, selectedCollection, search]);

  // Collection data with counts
  const collectionData = useMemo(() =>
    collections.map(collection => ({
      ...collection,
      count: blogs.filter(b => b.collection === collection.id).length
    })),
    [collections, blogs]
  );

  const handleDelete = (id: string, title: string) => {
    if (confirm(`确定删除文章"${title}"吗？`)) {
      deleteBlog(id);
    }
  };

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (confirm(`确定删除合集"${collectionName}"吗？这将同时删除合集内的所有文章！`)) {
      const success = await deleteCollection("blogs", collectionId);
      if (!success) {
        alert("删除合集失败");
      }
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      alert("请输入合集名称");
      return;
    }

    const id = newCollectionName
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const success = await createCollection("blogs", id, newCollectionName, newCollectionDescription);
    if (success) {
      setIsCreateDialogOpen(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
      const updated = await fetchCollections("blogs");
      setCollections(updated);
    } else {
      alert("创建合集失败");
    }
  };

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    draft: { label: "草稿", variant: "secondary" },
    published: { label: "已发布", variant: "default" },
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs Navigation */}
        <div className="flex items-center justify-between mb-8">
          <TabsList className="h-10 p-1 bg-muted/50">
            <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-background">
              <FileText className="w-4 h-4" aria-hidden="true" />
              列表视图
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2 data-[state=active]:bg-background">
              <Folder className="w-4 h-4" aria-hidden="true" />
              合集管理
            </TabsTrigger>
          </TabsList>

          {/* New Blog Button */}
          {activeTab === "list" && (
            <Button asChild className="gap-2">
              <Link href="/admin/blogs/new">
                <Plus className="w-4 h-4" aria-hidden="true" /> 新建文章
              </Link>
            </Button>
          )}
        </div>

        {/* List View */}
        <TabsContent value="list" className="animate-in fade-in-50 slide-in-from-bottom-2">
          {/* Header with filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">博客列表</h2>
                <p className="text-sm text-muted-foreground">共 {filteredBlogs.length} 篇文章</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {collections.length > 0 && (
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="w-[180px]" aria-label="Filter by collection">
                    <SelectValue placeholder="选择合集" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>全部</span>
                        <Badge variant="outline">{blogs.length}</Badge>
                      </div>
                    </SelectItem>
                    {collectionData.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{c.name}</span>
                          <Badge variant="outline">{c.count}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  placeholder="搜索文章..."
                  className="pl-10 w-full sm:w-[250px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search articles"
                />
              </div>
            </div>
          </div>

          {/* Blog Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">文章标题</TableHead>
                  <TableHead className="font-semibold">所属合集</TableHead>
                  <TableHead className="font-semibold">状态</TableHead>
                  <TableHead className="font-semibold">发布日期</TableHead>
                  <TableHead className="text-right font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50">
                          <FileText className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium mb-1">
                            {search || selectedCollection !== "all" ? "没有找到匹配的文章" : "暂无文章"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {search || selectedCollection !== "all"
                              ? "尝试调整筛选条件或搜索关键词"
                              : "点击上方按钮添加第一篇文章"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBlogs.map((blog) => (
                    <TableRow key={blog.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="max-w-md">
                          <div className="font-medium mb-0.5">{blog.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {blog.excerpt}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {blog.collection ? (
                          <Badge variant="secondary" className="font-normal">
                            {collections.find((c) => c.id === blog.collection)?.name || blog.collection}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground font-normal">
                            未分类
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[blog.status]?.variant || "secondary"}>
                          {statusMap[blog.status]?.label || blog.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <time
                          dateTime={blog.publishedAt}
                          className="text-sm text-muted-foreground"
                        >
                          {new Date(blog.publishedAt).toLocaleDateString("zh-CN")}
                        </time>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                            aria-label={`Edit ${blog.title}`}
                          >
                            <Link href={`/admin/blogs/${blog.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => handleDelete(blog.id, blog.title)}
                            aria-label={`Delete ${blog.title}`}
                            disabled={isPushing}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Collections Management */}
        <TabsContent value="collections" className="animate-in fade-in-50 slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Folder className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">博客合集</h2>
                <p className="text-sm text-muted-foreground">共 {collections.length} 个合集</p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isPushing}
              className="gap-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> 创建合集
            </Button>
          </div>

          {/* Collections Grid */}
          {collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectionData.map((collection) => (
                <div
                  key={collection.id}
                  className="group relative rounded-xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCollection(collection.id);
                    setActiveTab("list");
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:scale-110 transition-transform">
                        <Folder className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{collection.name}</h3>
                        <p className="text-sm text-muted-foreground">{collection.count} 篇文章</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 -mr-1 -mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id, collection.name);
                      }}
                      disabled={isPushing}
                      aria-label={`Delete collection ${collection.name}`}
                    >
                      {isPushing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-primary/0 group-hover:ring-primary/10 transition-all pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <Folder className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
              </div>
              <p className="text-muted-foreground">暂无合集，点击右上角按钮创建</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建博客合集</DialogTitle>
            <DialogDescription>
              创建一个新的合集来组织你的文章
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">合集名称 <span className="text-destructive">*</span></Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="例如：技术教程"
                disabled={isPushing}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-description">描述（可选）</Label>
              <Input
                id="collection-description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="简要描述这个合集的内容"
                disabled={isPushing}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isPushing}
            >
              取消
            </Button>
            <Button onClick={handleCreateCollection} disabled={isPushing || !newCollectionName.trim()}>
              {isPushing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  创建中
                </>
              ) : (
                "创建"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, FileText, Folder, ChevronLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function AdminBlogs() {
  const { blogs, deleteBlog, blogCollections, fetchCollections, deleteCollection, isPushing } = useData();
  const [collections, setCollections] = useState(blogCollections);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections("blogs").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBlogs = selectedCollection === "__uncollected__"
    ? blogs.filter(b => !b.collection)
    : blogs.filter(b => b.collection === selectedCollection);

  const collectionData = collections.map(collection => ({
    ...collection,
    count: blogs.filter(b => b.collection === collection.id).length
  }));

  const uncollectionCount = blogs.filter(b => !b.collection).length;

  const handleDelete = (id: string) => {
    if (confirm("确定删除这篇文章吗？")) {
      deleteBlog(id);
    }
  };

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (confirm(`确定删除合集"${collectionName}"吗？这将同时删除合集内的所有文章！`)) {
      const success = await deleteCollection("blogs", collectionId);
      if (success) {
        if (selectedCollection === collectionId) {
          setSelectedCollection(null);
        }
      } else {
        alert("删除合集失败");
      }
    }
  };

  const getSelectedCollectionName = () => {
    if (!selectedCollection) return "";
    const collection = collections.find(c => c.id === selectedCollection);
    return collection?.name || selectedCollection;
  };

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    draft: { label: "草稿", variant: "secondary" },
    published: { label: "已发布", variant: "default" }
  };

  // Collection View (Grid of folders)
  if (!selectedCollection) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">博客合集</h2>
              <p className="text-sm text-muted-foreground">共 {collections.length} 个合集</p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/blogs/new">
              <Plus className="w-4 h-4" /> 新建文章
            </Link>
          </Button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Uncollected Blogs */}
          <div
            className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => setSelectedCollection("__uncollected__")}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                  <Folder className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">未分类文章</h3>
                  <p className="text-sm text-muted-foreground">{uncollectionCount} 篇文章</p>
                </div>
              </div>
            </div>
          </div>

          {/* Collections */}
          {collectionData.map(collection => (
            <div
              key={collection.id}
              className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => setSelectedCollection(collection.id)}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Folder className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">{collection.count} 篇文章</p>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{collection.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(collection.id, collection.name);
                  }}
                  disabled={isPushing}
                >
                  {isPushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {collections.length === 0 && uncollectionCount === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>暂无合集和文章，点击上方按钮添加</p>
          </div>
        )}
      </div>
    );
  }

  // Collection Detail View
  const isUncollected = selectedCollection === "__uncollected__";

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedCollection(null)}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {isUncollected ? "未分类文章" : getSelectedCollectionName()}
            </h2>
            <p className="text-sm text-muted-foreground">共 {filteredBlogs.length} 篇文章</p>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/blogs/new">
            <Plus className="w-4 h-4" /> 新建文章
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">文章标题</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>发布日期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-12 h-12 opacity-20" />
                    <p>该合集暂无文章</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map(blog => (
                <TableRow key={blog.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-semibold">{blog.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {blog.excerpt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[blog.status]?.variant || "secondary"}>
                      {statusMap[blog.status]?.label || blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(blog.publishedAt).toLocaleDateString("zh-CN")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <Link href={`/admin/blogs/${blog.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDelete(blog.id)}
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
    </div>
  );
}

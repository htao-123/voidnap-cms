"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, FolderKanban, Folder, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminProjects() {
  const { projects, deleteProject, projectCollections, fetchCollections, deleteCollection, createCollection, isPushing } = useData();
  const [collections, setCollections] = useState(projectCollections);
  const [activeTab, setActiveTab] = useState<string>("list");  // "list" | "collections"
  const [selectedCollection, setSelectedCollection] = useState<string>("all");  // 筛选器: "all" | collectionId
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  useEffect(() => {
    fetchCollections("projects").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with context when collections change (e.g., after deletion)
  useEffect(() => {
    setCollections(projectCollections);
  }, [projectCollections]);

  // 筛选逻辑
  const filteredProjects = useMemo(() => {
    if (selectedCollection === "all") {
      return projects;
    } else {
      return projects.filter(p => p.collection === selectedCollection);
    }
  }, [projects, selectedCollection]);

  // 计算每个合集的项目数量
  const collectionData = collections.map(collection => ({
    ...collection,
    count: projects.filter(p => p.collection === collection.id).length
  }));

  const uncollectedCount = projects.filter(p => !p.collection).length;

  const handleDelete = (id: string) => {
    if (confirm("确定删除这个项目吗？")) {
      deleteProject(id);
    }
  };

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (confirm(`确定删除合集"${collectionName}"吗？这将同时删除合集内的所有项目！`)) {
      const success = await deleteCollection("projects", collectionId);
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

    // Generate ID from name (slug format)
    const id = newCollectionName
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const success = await createCollection("projects", id, newCollectionName, newCollectionDescription);
    if (success) {
      setIsCreateDialogOpen(false);
      setNewCollectionName("");
      setNewCollectionDescription("");
      // Refresh collections
      const updated = await fetchCollections("projects");
      setCollections(updated);
    } else {
      alert("创建合集失败");
    }
  };

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 h-auto p-1 bg-background shadow-sm">
        <TabsTrigger value="list" className="data-[state=active]:bg-background">
          <Folder className="w-4 h-4 mr-2" />
          列表视图
        </TabsTrigger>
        <TabsTrigger value="collections" className="data-[state=active]:bg-background">
          <FolderKanban className="w-4 h-4 mr-2" />
          合集管理
        </TabsTrigger>
      </TabsList>

      {/* 列表视图 */}
      <TabsContent value="list" className="animate-in fade-in-50 slide-in-from-bottom-2">
        {/* Header 和新建按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">项目列表</h2>
              <p className="text-sm text-muted-foreground">共 {projects.length} 个项目</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {collections.length > 0 && (
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择合集" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span>全部</span>
                      <Badge variant="outline">{projects.length}</Badge>
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
            <Button asChild className="gap-2">
              <Link href="/admin/projects/new">
                <Plus className="w-4 h-4" /> 新建项目
              </Link>
            </Button>
          </div>
        </div>

        {/* 项目表格 */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">项目名称</TableHead>
                <TableHead className="font-semibold">所属合集</TableHead>
                <TableHead className="font-semibold">技术标签</TableHead>
                <TableHead className="text-right font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <FolderKanban className="w-12 h-12 opacity-20" />
                      <p>
                        {selectedCollection === "all"
                          ? "暂无项目，点击上方按钮添加"
                          : "该合集暂无项目"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map(project => (
                  <TableRow key={project.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <div className="font-semibold">{project.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {project.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.collection ? (
                        <Badge variant="secondary">
                          {collections.find(c => c.id === project.collection)?.name || project.collection}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">未分类</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
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
                          <Link href={`/admin/projects/${project.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleDelete(project.id)}
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

      {/* 合集管理 */}
      <TabsContent value="collections" className="animate-in fade-in-50 slide-in-from-bottom-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">项目合集</h2>
              <p className="text-sm text-muted-foreground">共 {collections.length} 个合集</p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={isPushing}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> 创建合集
          </Button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Collections */}
          {collectionData.map(collection => (
            <div
              key={collection.id}
              className="rounded-xl border bg-card p-6 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                setSelectedCollection(collection.id);
                setActiveTab("list");
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Folder className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">{collection.count} 个项目</p>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{collection.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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

        {collections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>暂无合集，点击右上角按钮创建</p>
          </div>
        )}
      </TabsContent>
    </Tabs>

    {/* Create Collection Dialog */}
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建项目合集</DialogTitle>
          <DialogDescription>
            创建一个新的合集来组织你的项目
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">合集名称 *</Label>
            <Input
              id="name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="例如：Web 开发"
              disabled={isPushing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Input
              id="description"
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
          <Button onClick={handleCreateCollection} disabled={isPushing}>
            {isPushing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            创建
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

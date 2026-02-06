"use client";

import { useState, useEffect } from "react";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, FolderKanban, Folder, ChevronLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function AdminProjects() {
  const { projects, deleteProject, projectCollections, fetchCollections, deleteCollection, isPushing } = useData();
  const [collections, setCollections] = useState(projectCollections);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections("projects").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProjects = selectedCollection === "__uncollected__"
    ? projects.filter(p => !p.collection)
    : projects.filter(p => p.collection === selectedCollection);

  const collectionData = collections.map(collection => ({
    ...collection,
    count: projects.filter(p => p.collection === collection.id).length
  }));

  const uncollectionCount = projects.filter(p => !p.collection).length;

  const handleDelete = (id: string) => {
    if (confirm("确定删除这个项目吗？")) {
      deleteProject(id);
    }
  };

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (confirm(`确定删除合集"${collectionName}"吗？这将同时删除合集内的所有项目！`)) {
      const success = await deleteCollection("projects", collectionId);
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

  // Collection View (Grid of folders)
  if (!selectedCollection) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">项目合集</h2>
              <p className="text-sm text-muted-foreground">共 {collections.length} 个合集</p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/projects/new">
              <Plus className="w-4 h-4" /> 添加项目
            </Link>
          </Button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Uncollected Projects */}
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
                  <h3 className="font-semibold">未分类项目</h3>
                  <p className="text-sm text-muted-foreground">{uncollectionCount} 个项目</p>
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
                    <p className="text-sm text-muted-foreground">{collection.count} 个项目</p>
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
            <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>暂无合集和项目，点击上方按钮添加</p>
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
              {isUncollected ? "未分类项目" : getSelectedCollectionName()}
            </h2>
            <p className="text-sm text-muted-foreground">共 {filteredProjects.length} 个项目</p>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/projects/new">
            <Plus className="w-4 h-4" /> 添加项目
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">项目名称</TableHead>
              <TableHead>技术标签</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <FolderKanban className="w-12 h-12 opacity-20" />
                    <p>该合集暂无项目</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map(project => (
                <TableRow key={project.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-semibold">{project.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {project.description}
                    </div>
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
    </div>
  );
}

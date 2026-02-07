"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/lib/data-context";
import { ProjectCard } from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Folder, FolderKanban, Search, Rocket, Briefcase } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProjectsPage() {
  const { projects, projectCollections, fetchCollections } = useData();
  const [collections, setCollections] = useState(projectCollections);
  const [activeTab, setActiveTab] = useState<string>("collections");  // "list" | "collections"
  const [selectedCollection, setSelectedCollection] = useState<string>("all");  // 筛选器: "all" | "__uncollected__" | collectionId
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCollections("projects").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选逻辑
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (selectedCollection === "all") {
      result = projects;
    } else if (selectedCollection === "__uncollected__") {
      result = projects.filter(p => !p.collection);
    } else {
      result = projects.filter(p => p.collection === selectedCollection);
    }
    return result;
  }, [projects, selectedCollection]);

  const searchedProjects = filteredProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  // 计算每个合集的项目数量
  const collectionData = collections.map(collection => ({
    ...collection,
    count: projects.filter(p => p.collection === collection.id).length
  }));

  const uncollectedCount = projects.filter(p => !p.collection).length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              <span>创意与实现</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight mb-6">
              项目作品
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              这里汇集了我的一些实验性项目、产品原型以及开源贡献
            </p>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{projects.length} 个项目</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span>{collections.length} 个合集</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 h-auto p-1 bg-muted/50 mx-auto w-fit">
            <TabsTrigger value="collections" className="data-[state=active]:bg-background gap-2">
              <Folder className="w-4 h-4" />
              合集视图
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-background gap-2">
              <FolderKanban className="w-4 h-4" />
              列表视图
            </TabsTrigger>
          </TabsList>

          {/* 合集视图 */}
          <TabsContent value="collections" className="animate-in fade-in-50 slide-in-from-bottom-2">
            {collections.length > 0 || uncollectedCount > 0 ? (
              <div>
                <div className="flex flex-wrap gap-6">
                  {/* Uncollected */}
                  {uncollectedCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCollection("__uncollected__");
                        setActiveTab("list");
                      }}
                      className="group text-left w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                    >
                      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 p-6 transition-all hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-400 dark:hover:border-amber-700">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                            <Folder className="w-7 h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              未分类项目
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {uncollectedCount} 个项目
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Collections */}
                  {collectionData.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => {
                        setSelectedCollection(collection.id);
                        setActiveTab("list");
                      }}
                      className="group text-left w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/10 group-hover:scale-110 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                              <Folder className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                {collection.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {collection.count} 个项目
                              </p>
                            </div>
                          </div>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                  <FolderKanban className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-semibold mb-2">暂无项目</h3>
                <p className="text-muted-foreground">还没有发布任何项目</p>
              </div>
            )}
          </TabsContent>

          {/* 列表视图 */}
          <TabsContent value="list" className="animate-in fade-in-50 slide-in-from-bottom-2">
            {/* 筛选器和搜索 */}
            <div className="max-w-5xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <FolderKanban className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">项目列表</h2>
                    <p className="text-sm text-muted-foreground">共 {searchedProjects.length} 个项目</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
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
                        {uncollectedCount > 0 && (
                          <SelectItem value="__uncollected__">
                            <div className="flex items-center justify-between w-full gap-2">
                              <span>未分类</span>
                              <Badge variant="outline">{uncollectedCount}</Badge>
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索项目..."
                      className="pl-10 w-full sm:w-[250px]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 项目网格 */}
            <div className="max-w-6xl mx-auto">
              {searchedProjects.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                    <FolderKanban className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground">
                    {search ? "没有找到匹配的项目" : "该合集暂无项目"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {searchedProjects.map((project) => (
                    <div key={project.id} className="h-[400px]">
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

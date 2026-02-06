"use client";

import { useState, useEffect } from "react";
import { useData } from "@/lib/data-context";
import { ProjectCard } from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Folder, FolderKanban, ChevronLeft, Search, Rocket, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const { projects, projectCollections, fetchCollections } = useData();
  const [collections, setCollections] = useState(projectCollections);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCollections("projects").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProjects = selectedCollection === "__uncollected__"
    ? projects.filter(p => !p.collection)
    : projects.filter(p => p.collection === selectedCollection);

  const searchedProjects = filteredProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const collectionData = collections.map(collection => ({
    ...collection,
    count: projects.filter(p => p.collection === collection.id).length
  }));

  const uncollectionCount = projects.filter(p => !p.collection).length;

  // Collection View
  if (!selectedCollection) {
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

        {/* Collections Grid */}
        <div className="container px-4 py-16">
          {collections.length > 0 || uncollectionCount > 0 ? (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Uncollected */}
                {uncollectionCount > 0 && (
                  <button
                    onClick={() => setSelectedCollection("__uncollected__")}
                    className="group text-left"
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
                            {uncollectionCount} 个项目
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
                    onClick={() => setSelectedCollection(collection.id)}
                    className="group text-left"
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
        </div>
      </div>
    );
  }

  // Collection Detail View
  const isUncollected = selectedCollection === "__uncollected__";
  const currentCollection = collections.find(c => c.id === selectedCollection);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCollection(null)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            返回合集列表
          </Button>
        </div>
      </div>

      {/* Collection Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${
                isUncollected
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/10'
              }`}>
                <Folder className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
                  {isUncollected ? "未分类项目" : currentCollection?.name}
                </h1>
                {currentCollection?.description && (
                  <p className="text-muted-foreground mt-2">{currentCollection.description}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              共 {searchedProjects.length} 个项目
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索项目..."
                className="pl-10 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container px-4 py-12">
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
    </div>
  );
}

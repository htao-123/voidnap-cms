"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/lib/data-context";
import { BlogCard } from "@/components/BlogCard";
import { Folder, FileText, BookOpen, Sparkles, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BlogPage() {
  const { blogs, blogCollections, fetchCollections } = useData();
  const [collections, setCollections] = useState(blogCollections);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCollections("blogs").then(setCollections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter logic
  const filteredBlogs = useMemo(() => {
    if (selectedCollection === "all") {
      return blogs;
    } else if (selectedCollection === "__uncollected__") {
      return blogs.filter(b => !b.collection);
    }
    return blogs.filter(b => b.collection === selectedCollection);
  }, [blogs, selectedCollection]);

  const searchedBlogs = useMemo(() =>
    filteredBlogs.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    ),
    [filteredBlogs, search]
  );

  // Collection data with counts
  const collectionData = useMemo(() =>
    collections.map(collection => ({
      ...collection,
      count: blogs.filter(b => b.collection === collection.id).length
    })),
    [collections, blogs]
  );

  const uncollectedCount = useMemo(() =>
    blogs.filter(b => !b.collection).length,
    [blogs]
  );

  const handleCollectionClick = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setActiveTab("list");
    // Scroll to top of list view
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-primary/[0.02]">
        <div className="container px-4 py-16 md:py-24 lg:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>思考与随笔</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight">
              博客文章
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              关于软件工程、设计思维和前沿技术的深度思考与探索
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>{blogs.length} 篇文章</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" aria-hidden="true" />
                <span>{collections.length} 个合集</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <div className="flex justify-center mb-10">
            <TabsList className="h-10 p-1 bg-muted/50">
              <TabsTrigger
                value="list"
                className="gap-2 data-[state=active]:bg-background"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                列表视图
              </TabsTrigger>
              <TabsTrigger
                value="collections"
                className="gap-2 data-[state=active]:bg-background"
              >
                <Folder className="w-4 h-4" aria-hidden="true" />
                合集视图
              </TabsTrigger>
            </TabsList>
          </div>

          {/* List View */}
          <TabsContent value="list" className="animate-in fade-in-50 slide-in-from-bottom-2">
            {/* Filter bar */}
            <div className="max-w-5xl mx-auto mb-10">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Title & Count */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">博客列表</h2>
                    <p className="text-sm text-muted-foreground">
                      共 {searchedBlogs.length} 篇文章
                    </p>
                  </div>
                </div>

                {/* Filters */}
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
            </div>

            {/* Blog Grid */}
            <div className="max-w-6xl mx-auto">
              {searchedBlogs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
                  </div>
                  <p className="text-muted-foreground">
                    {search ? "没有找到匹配的文章" : "该合集暂无文章"}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchedBlogs.map((blog, index) => (
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      priority={index < 6}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Collections View */}
          <TabsContent value="collections" className="animate-in fade-in-50 slide-in-from-bottom-2">
            {collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Collections */}
                {collectionData.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleCollectionClick(collection.id)}
                    className="group text-left"
                    aria-label={`View ${collection.count} articles in ${collection.name}`}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="relative">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/10 group-hover:scale-110 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                            <Folder className="w-7 h-7" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                              {collection.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {collection.count} 篇文章
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
            ) : (
              <div className="max-w-2xl mx-auto text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                  <FileText className="w-10 h-10 text-muted-foreground/40" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
                <p className="text-muted-foreground">还没有发布任何文章</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

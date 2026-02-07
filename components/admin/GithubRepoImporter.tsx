"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/lib/data-context";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Search, Star, GitFork, Calendar, Loader2, CheckCircle2, Code, Globe, Sparkles, Bot } from "lucide-react";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  homepage: string | null;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface RepoImportProps {
  onImport?: (project: Project) => void;
}

const AI_MODEL_COLOR = "text-blue-600";

export function GithubRepoImporter({ onImport }: RepoImportProps) {
  const { pushProject, syncProjects, isPushing, fetchCollections, projects } = useData();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [importedRepos, setImportedRepos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRepos();
  }, []);

  // 初始化已导入项目列表（根据当前 projects 状态）
  useEffect(() => {
    if (projects.length > 0) {
      const imported = new Set<string>();
      projects.forEach(p => {
        // 从 GitHub URL 提取 owner/repo
        if (p.github) {
          const match = p.github.match(/github\.com\/([^/]+)\/([^/]+)/);
          if (match) {
            imported.add(`${match[1]}/${match[2]}`);
          }
        }
      });
      setImportedRepos(imported);
    }
  }, [projects]);

  useEffect(() => {
    let filtered = repos;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description?.toLowerCase().includes(query)
      );
    }

    if (selectedLanguage !== "all") {
      filtered = filtered.filter((repo) => repo.language === selectedLanguage);
    }

    setFilteredRepos(filtered);
  }, [repos, searchQuery, selectedLanguage]);

  const fetchRepos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/github/repos");
      if (response.ok) {
        const data = await response.json();
        setRepos(data.repos || []);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to fetch repositories");
      }
    } catch (error) {
      console.error("Error fetching repos:", error);
      alert("Failed to fetch repositories");
    } finally {
      setIsLoading(false);
    }
  };

  const languages = useMemo(() => {
    const langSet = new Set<string>();
    repos.forEach((repo) => {
      if (repo.language) {
        langSet.add(repo.language);
      }
    });
    return Array.from(langSet).sort();
  }, [repos]);

  const handleImport = async (repo: GitHubRepo) => {
    setImportingRepo(repo.full_name);
    try {
      const [owner, repoName] = repo.full_name.split("/");

      const response = await fetch(`/api/github/repos/${owner}/${repoName}`);
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to fetch repository details");
        return;
      }

      const { project } = await response.json();

      // 检查项目是否已导入（通过 GitHub URL 判断）
      const existingProject = projects.find(p => p.github === project.github);
      if (existingProject) {
        alert(`项目 "${project.title}" 已经导入过了`);
        setImportedRepos((prev) => new Set(prev).add(repo.full_name));
        return;
      }

      if (onImport) {
        onImport(project);
      } else {
        const pushed = await pushProject(project);
        if (pushed) {
          await Promise.all([
            syncProjects(),
            fetchCollections("projects"),
          ]);
          setImportedRepos((prev) => new Set(prev).add(repo.full_name));
        } else {
          alert("Failed to save project");
        }
      }
    } catch (error) {
      console.error("Error importing repo:", error);
      alert("Failed to import repository");
    } finally {
      setImportingRepo(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">从 GitHub 导入</h3>
          <p className="text-sm text-muted-foreground">
            选择一个仓库导入为项目
          </p>
        </div>
        <Button onClick={fetchRepos} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
          刷新
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="搜索仓库名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-3 py-2 rounded-md border bg-background text-sm"
        >
          <option value="all">所有语言</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Github className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>{repos.length === 0 ? "没有找到任何仓库" : "没有匹配的仓库"}</p>
        </div>
      ) : (
        <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredRepos.map((repo) => (
            <Card
              key={repo.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg truncate">{repo.name}</CardTitle>
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${AI_MODEL_COLOR} border-current bg-opacity-10 dark:bg-opacity-20`}>
                        <Bot className="w-3 h-3 mr-1" />
                        AI 简介
                      </Badge>
                      {importedRepos.has(repo.full_name) && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          已导入
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {repo.description || "暂无描述"}
                    </CardDescription>
                  </div>
                  <img
                    src={repo.owner.avatar_url}
                    alt={repo.owner.login}
                    className="w-10 h-10 rounded-full"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repo.forks_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>更新于 {formatDate(repo.updated_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                    {repo.homepage && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <Globe className="w-4 h-4" />
                          Demo
                        </a>
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleImport(repo)}
                    disabled={importingRepo === repo.full_name || isPushing || importedRepos.has(repo.full_name)}
                  >
                    {importingRepo === repo.full_name ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI 分析中...
                        </span>
                      </>
                    ) : importedRepos.has(repo.full_name) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        已导入
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4 mr-2" />
                        导入
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

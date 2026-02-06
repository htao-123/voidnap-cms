"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Github,
  Loader2,
  Settings2,
  CheckCircle,
  Save,
  RefreshCw,
  Plus,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CMSConfig {
  repo: string;
  branch: string;
}

export function AdminGithub() {
  const [config, setConfig] = useState<CMSConfig | null>(null);
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDescription, setNewRepoDescription] = useState("个人网站内容 - 由 CMS 管理");
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [isCheckingRepo, setIsCheckingRepo] = useState(false);
  const [repoExists, setRepoExists] = useState<boolean | null>(null);

  // Ref to prevent double loading in StrictMode
  const isLoadingRef = useRef(false);
  const hasMountedRef = useRef(false);

  // Load config
  const loadConfig = async () => {
    // Prevent concurrent requests
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setRepo(data?.repo || "");
        setBranch(data?.branch || "main");
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    // Only load once per mount (prevents StrictMode double call)
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      loadConfig();
    }
  }, []);

  // Check if repository exists
  const checkRepoExists = async (owner: string, repoName: string) => {
    if (!owner || !repoName) {
      setRepoExists(null);
      return;
    }
    setIsCheckingRepo(true);
    try {
      const res = await fetch(`/api/repo/check/${owner}/${repoName}`);
      const data = await res.json();
      if (res.ok) {
        setRepoExists(data.exists);
      } else {
        console.error("Failed to check repo:", data.error);
        // If unauthorized, show as unknown (could exist but need auth)
        setRepoExists(res.status === 401 ? null : false);
      }
    } catch (error) {
      console.error("Failed to check repo:", error);
      setRepoExists(null);
    } finally {
      setIsCheckingRepo(false);
    }
  };

  // Check repo when input changes
  useEffect(() => {
    const match = repo.match(/^([^/]+)\/([^/]+)$/);
    if (match) {
      checkRepoExists(match[1], match[2]);
    } else {
      setRepoExists(null);
    }
  }, [repo]);

  const handleSaveConfig = async () => {
    if (!repo) {
      alert("请填写仓库路径");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, branch: branch || "main" }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        alert("配置保存成功！");
      } else {
        const error = await res.json();
        alert(error.error || "保存配置失败");
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("保存配置失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName) {
      alert("请输入仓库名称");
      return;
    }

    setIsCreatingRepo(true);
    try {
      const res = await fetch("/api/repo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRepoName,
          description: newRepoDescription,
          isPrivate: newRepoPrivate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setRepo(data.config.repo);
        setBranch(data.config.branch);
        setShowCreateDialog(false);
        setNewRepoName("");
        alert("仓库创建成功！");
      } else {
        const error = await res.json();
        alert(error.error || "创建仓库失败");
      }
    } catch (error) {
      console.error("Failed to create repo:", error);
      alert("创建仓库失败");
    } finally {
      setIsCreatingRepo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">GitHub 内容仓库配置</h2>
            <p className="text-sm text-muted-foreground">配置用于存储内容的 GitHub 仓库</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            创建新仓库
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadConfig}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            刷新
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className={config?.repo ? "border-green-200 bg-green-50/50 dark:bg-green-950/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            仓库状态
            {config?.repo && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                已配置
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {config?.repo
              ? `已连接到 ${config.repo} (${config.branch})`
              : "未配置内容仓库"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            仓库配置
          </CardTitle>
          <CardDescription>
            {config?.repo
              ? "当前已配置的仓库信息"
              : "配置用于存储项目、博客等内容的 GitHub 仓库"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="repo">仓库路径 (Repository)</Label>
            <Input
              id="repo"
              placeholder="例如: username/content-repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
            />
            <div className="flex items-center gap-2 text-xs">
              {isCheckingRepo && <Loader2 className="w-3 h-3 animate-spin" />}
              {repoExists === true && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  仓库存在
                </span>
              )}
              {repoExists === false && (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  仓库不存在，请先创建或检查路径
                </span>
              )}
              {!repoExists && !isCheckingRepo && (
                <span className="text-muted-foreground">
                  GitHub 仓库完整路径，格式为 <code>owner/repo</code>
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="branch">分支 (Branch)</Label>
            <Input
              id="branch"
              placeholder="例如: main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              内容存储的分支，默认为 main
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveConfig}
              disabled={!repo || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              保存配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repository Structure Guide */}
      <Card>
        <CardHeader>
          <CardTitle>仓库结构说明</CardTitle>
          <CardDescription>
            内容将以 Markdown 文件形式存储在您的仓库中
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
            <div>📁 your-repo/</div>
            <div className="ml-4">└── 📁 data/</div>
            <div className="ml-8">├── 📄 profile.md</div>
            <div className="ml-8">├── 📁 projects/</div>
            <div className="ml-12">│   ├── 📄 project-1.md</div>
            <div className="ml-12">│   ├── 📄 project-2.md</div>
            <div className="ml-12">│   ├── 📁 collection-name/</div>
            <div className="ml-16">│   │   └── 📄 project-3.md</div>
            <div className="ml-12">│   └── ...</div>
            <div className="ml-8">└── 📁 blogs/</div>
            <div className="ml-12">    ├── 📄 blog-1.md</div>
            <div className="ml-12">    ├── 📄 blog-2.md</div>
            <div className="ml-12">    ├── 📁 collection-name/</div>
            <div className="ml-16">    │   └── 📄 blog-3.md</div>
            <div className="ml-12">    └── ...</div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground space-y-2">
            <p>
              <strong>data/profile.md</strong>: 个人资料和简历信息
            </p>
            <p>
              <strong>data/projects/**/*.md</strong>: 项目 Markdown 文件，支持合集（子目录）
            </p>
            <p>
              <strong>data/blogs/**/*.md</strong>: 博客 Markdown 文件，支持合集（子目录）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Repo Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新的内容仓库</DialogTitle>
            <DialogDescription>
              在你的 GitHub 账号下创建一个新的仓库来存储网站内容
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newRepoName">仓库名称</Label>
              <Input
                id="newRepoName"
                placeholder="例如: my-cms-content"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                只能包含字母、数字、连字符和下划线
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newRepoDescription">描述</Label>
              <Input
                id="newRepoDescription"
                placeholder="仓库描述"
                value={newRepoDescription}
                onChange={(e) => setNewRepoDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="private"
                checked={newRepoPrivate}
                onCheckedChange={(checked) => setNewRepoPrivate(checked)}
              />
              <Label htmlFor="private" className="cursor-pointer">
                设为私有仓库
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateRepo}
              disabled={!newRepoName || isCreatingRepo}
            >
              {isCreatingRepo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              创建仓库
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

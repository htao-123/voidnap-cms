"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold font-display text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold font-display mb-4">页面未找到</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在。可能是链接错误或页面已被移动。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="h-5 w-5 mr-2" /> 返回首页
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/projects">
              查看项目 <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

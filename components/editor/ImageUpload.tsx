"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, X, Loader2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  type?: "projects" | "blogs";
  aspectRatio?: "16:10" | "16:9" | "1:1" | "4:3";
}

export function ImageUpload({
  value,
  onChange,
  type = "projects",
  aspectRatio = "16:10",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aspect ratio classes
  const aspectRatioClasses: Record<string, string> = {
    "16:10": "aspect-[16/10]",
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
  };

  // Helper to delete old image from GitHub
  const deleteOldImage = async (oldImageUrl: string) => {
    // Only delete uploaded images (from our GitHub repo), not external URLs
    if (!oldImageUrl ||
        !oldImageUrl.includes("raw.githubusercontent.com") &&
        !oldImageUrl.includes("cdn.jsdelivr.net")) {
      return;
    }

    try {
      await fetch("/api/images/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: oldImageUrl }),
      });
    } catch (error) {
      console.error("Failed to delete old image:", error);
      // Don't block upload if delete fails
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      setUploadProgress(30);

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.details || error.error || "上传失败";
        throw new Error(errorMsg);
      }

      const data = await response.json();

      setUploadProgress(100);

      if (data.success && data.url) {
        // Delete old image if it was uploaded to our GitHub repo
        if (preview) {
          await deleteOldImage(preview);
        }

        setPreview(data.url);
        onChange(data.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "上传失败，请重试");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    // Delete old image when removing
    if (preview) {
      await deleteOldImage(preview);
    }
    setPreview("");
    onChange("");
  };

  const handleUrlChange = async (url: string) => {
    // Delete old image if URL changed
    if (preview && preview !== url) {
      await deleteOldImage(preview);
    }
    setPreview(url);
    onChange(url);
  };

  return (
    <div className="space-y-4">
      <Label>封面图片</Label>

      {/* Preview Area */}
      <Card
        className={`relative overflow-hidden border-dashed border-2 bg-muted/30 ${
          preview ? "border-border" : "border-muted-foreground/25"
        }`}
      >
        <div className="p-4">
          {preview ? (
            // Image preview
            <div className="relative w-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Upload placeholder
            <div className="w-full h-32 flex flex-col items-center justify-center text-muted-foreground">
              {isUploading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin mb-2" />
                  <p className="text-sm">上传中... {uploadProgress}%</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">暂无图片</p>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Upload Options */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              上传图片
            </>
          )}
        </Button>

        {preview && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-3">
            <Check className="h-4 w-4 text-green-600" />
            已设置封面
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Or enter URL manually */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">或输入图片 URL</Label>
        <Input
          placeholder="https://example.com/image.jpg"
          value={preview}
          onChange={(e) => handleUrlChange(e.target.value)}
          disabled={isUploading}
        />
      </div>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        支持 JPG、PNG、WebP、GIF 格式，最大 5MB。图片将上传到 GitHub 仓库。
      </p>
    </div>
  );
}

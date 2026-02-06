"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Github, Linkedin, X as TwitterIcon } from "lucide-react";

export function AdminProfile() {
  const { profile, updateProfile } = useData();
  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    updateProfile(formData);
    alert("个人资料已更新");
  };

  const addSkill = (categoryIndex: number) => {
    const skill = prompt("输入新技能:");
    if (skill) {
      const newSkills = [...formData.resume.skills];
      newSkills[categoryIndex] = {
        ...newSkills[categoryIndex],
        items: [...newSkills[categoryIndex].items, skill]
      };
      setFormData({ ...formData, resume: { ...formData.resume, skills: newSkills } });
    }
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const newSkills = [...formData.resume.skills];
    newSkills[categoryIndex] = {
      ...newSkills[categoryIndex],
      items: newSkills[categoryIndex].items.filter((_, i) => i !== skillIndex)
    };
    setFormData({ ...formData, resume: { ...formData.resume, skills: newSkills } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">个人设置</h2>
          <p className="text-sm text-muted-foreground">编辑你的个人资料和简历信息</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>姓名</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>职位</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>个人简介</Label>
              <Textarea
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>邮箱</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>社交链接</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Github className="h-4 w-4" /> GitHub
              </Label>
              <Input
                placeholder="https://github.com/username"
                value={formData.socials.github || ""}
                onChange={e => setFormData({...formData, socials: {...formData.socials, github: e.target.value}})}
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </Label>
              <Input
                placeholder="https://linkedin.com/in/username"
                value={formData.socials.linkedin || ""}
                onChange={e => setFormData({...formData, socials: {...formData.socials, linkedin: e.target.value}})}
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <TwitterIcon className="h-4 w-4" /> Twitter / X
              </Label>
              <Input
                placeholder="https://x.com/username"
                value={formData.socials.twitter || ""}
                onChange={e => setFormData({...formData, socials: {...formData.socials, twitter: e.target.value}})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>技能特长</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {formData.resume.skills.map((skillGroup, categoryIndex) => (
              <div key={skillGroup.id}>
                <h4 className="font-semibold mb-3">{skillGroup.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill, skillIndex) => (
                    <Badge
                      key={skillIndex}
                      variant="secondary"
                      className="gap-1 group"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(categoryIndex, skillIndex)}
                        className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => addSkill(categoryIndex)}
                  >
                    + 添加
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSave}>
            保存更改
          </Button>
        </div>
      </div>
    </div>
  );
}

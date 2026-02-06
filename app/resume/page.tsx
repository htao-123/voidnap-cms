"use client";

import { useData } from "@/lib/data-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

export default function ResumePage() {
  const { profile } = useData();
  const { resume } = profile;

  return (
    <div className="container px-4 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">
              {profile.name}
            </h1>
            <p className="text-xl text-muted-foreground">{profile.title}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" /> 打印简历
            </Button>
            <Button asChild>
              <a href={`mailto:${profile.email}`}>
                <Mail className="h-4 w-4 mr-2" /> 联系我
              </a>
            </Button>
          </div>
        </div>

        {/* Experience */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
            工作经历
            <Separator className="flex-1 ml-4" />
          </h2>
          <div className="space-y-8">
            {resume.experience.map((exp) => (
              <div
                key={exp.id}
                className="grid md:grid-cols-[200px_1fr] gap-4"
              >
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {exp.period}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{exp.title}</h3>
                  <div className="text-primary font-medium mb-2">
                    {exp.subtitle}
                  </div>
                  <div className="text-muted-foreground prose prose-sm dark:prose-invert">
                    {exp.description.split("\n").map((line, i) => (
                      <p key={i} className="mb-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
            教育背景
            <Separator className="flex-1 ml-4" />
          </h2>
          <div className="space-y-8">
            {resume.education.map((edu) => (
              <div
                key={edu.id}
                className="grid md:grid-cols-[200px_1fr] gap-4"
              >
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {edu.period}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{edu.title}</h3>
                  <div className="text-primary font-medium">{edu.subtitle}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {edu.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
            技能特长
            <Separator className="flex-1 ml-4" />
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {resume.skills.map((skillGroup) => (
              <Card key={skillGroup.id}>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">{skillGroup.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

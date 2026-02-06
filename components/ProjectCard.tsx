import type { Project } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-all border-muted hover:border-primary/50">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex gap-2">
            {project.link && (
              <Button size="sm" variant="secondary" className="h-8 text-xs" asChild>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Demo
                </a>
              </Button>
            )}
            {project.github && (
              <Button size="sm" variant="secondary" className="h-8 text-xs" asChild>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3 w-3 mr-1" /> Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      <CardHeader className="p-5 pb-2">
        <h3 className="text-xl font-bold font-display line-clamp-1">
          {project.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {project.description}
        </p>
      </CardContent>
    </Card>
  );
}

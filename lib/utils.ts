import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data for development
import type { UserProfile, Project, BlogPost } from "@/types";

export const mockProfile: UserProfile = {
  name: "Alex Chen",
  title: "AI全栈工程师",
  bio: "专注于人工智能、Web开发和用户体验设计。热爱创造优雅而强大的数字产品，拥有5年以上的全栈开发经验。",
  email: "alex@example.com",
  avatarUrl: "",
  socials: {
    github: "https://github.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
  },
  resume: {
    experience: [
      {
        id: "1",
        title: "高级全栈工程师",
        subtitle: "科技创新公司",
        period: "2022 - 至今",
        description: "负责公司核心产品的架构设计和开发，带领团队完成多个重要项目。",
      },
      {
        id: "2",
        title: "前端工程师",
        subtitle: "互联网公司",
        period: "2020 - 2022",
        description: "负责前端框架搭建和组件库开发，提升开发效率和用户体验。",
      },
    ],
    education: [
      {
        id: "1",
        title: "计算机科学与技术",
        subtitle: "知名大学",
        period: "2016 - 2020",
        description: "本科，获得学士学位。主修软件工程、人工智能、数据结构与算法。",
      },
    ],
    skills: [
      {
        id: "1",
        category: "前端开发",
        items: ["React", "Next.js", "Vue", "TypeScript", "Tailwind CSS"],
      },
      {
        id: "2",
        category: "后端开发",
        items: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL"],
      },
      {
        id: "3",
        category: "AI/ML",
        items: ["TensorFlow", "PyTorch", "OpenAI API", "LangChain", "LLM"],
      },
      {
        id: "4",
        category: "DevOps",
        items: ["Docker", "Kubernetes", "AWS", "CI/CD", "Git"],
      },
    ],
  },
};

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI智能助手平台",
    description: "基于大语言模型的智能对话平台，支持多模态交互和知识库检索。",
    content: "",
    imageUrl: "/images/project-ai.jpeg",
    tags: ["AI", "React", "Python", "OpenAI"],
    link: "https://demo.example.com",
    github: "https://github.com",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    title: "数据可视化仪表板",
    description: "实时数据分析和可视化平台，支持自定义图表和报表生成。",
    content: "",
    imageUrl: "/images/project-dashboard.jpeg",
    tags: ["React", "D3.js", "Node.js"],
    link: "https://dashboard.example.com",
    github: "https://github.com",
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    title: "跨平台移动应用",
    description: "使用React Native开发的跨平台应用，提供流畅的原生体验。",
    content: "",
    imageUrl: "/images/project-mobile.jpeg",
    tags: ["React Native", "TypeScript", "Firebase"],
    github: "https://github.com",
    createdAt: "2024-03-01",
  },
];

export const mockBlogs: BlogPost[] = [
  {
    id: "1",
    title: "深入理解 React Server Components",
    excerpt: "React Server Components 是 React 18 引入的新特性，它改变了我们构建 React 应用的方式。本文将深入探讨其原理和最佳实践。",
    content: "",
    coverImage: "/images/blog-react.jpg",
    tags: ["React", "Next.js", "前端"],
    publishedAt: "2024-01-15",
    status: "published",
  },
  {
    id: "2",
    title: "使用 AI 构建智能应用",
    excerpt: "随着大语言模型的发展，将 AI 能力集成到应用中变得越来越容易。本文分享如何使用 OpenAI API 构建智能应用。",
    content: "",
    coverImage: "/images/blog-ai.jpg",
    tags: ["AI", "OpenAI", "Python"],
    publishedAt: "2024-02-01",
    status: "published",
  },
  {
    id: "3",
    title: "TypeScript 最佳实践",
    excerpt: "TypeScript 为 JavaScript 带来了类型安全，但要充分发挥其优势，需要掌握一些最佳实践。",
    content: "",
    tags: ["TypeScript", "前端"],
    publishedAt: "2024-02-15",
    status: "published",
  },
];

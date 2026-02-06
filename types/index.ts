export interface Collection {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface Project {
  id: string;
  collection?: string | null;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  tags: string[];
  link?: string;
  github?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  collection?: string | null;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  publishedAt: string;
  status: 'draft' | 'published';
}

export interface ResumeItem {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  email: string;
  socials: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  resume: {
    experience: ResumeItem[];
    education: ResumeItem[];
    skills: Skill[];
  };
}

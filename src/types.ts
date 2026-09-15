export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageCaption?: string;
  category: string;
  categorySlug: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorTitle?: string;
  tags: string[];
  views: number;
  status: 'published' | 'draft' | 'scheduled';
  featured: boolean;
  breaking: boolean;
  categoryFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  youtubeUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order: number;
}

export interface Author {
  id: string;
  name: string;
  title?: string;
  role?: string;
  bio: string;
  avatar: string;
  email?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface BreakingNews {
  id: string;
  title: string;
  link?: string;
  active: boolean;
  priority: number;
  createdAt: string;
}

export interface AdSlotConfig {
  id: string;
  name: string;
  location: 'top' | 'banner' | 'article' | 'sidebar' | 'footer';
  enabled: boolean;
  scriptCode: string;
  htmlContent?: string;
  width?: number | string;
  height?: number | string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoText?: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  contactAddress?: string;
  copyrightText?: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    youtube: string;
    instagram: string;
    telegram: string;
    whatsapp: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalCategories: number;
  totalAuthors: number;
  totalSubscribers: number;
  recentArticles: Article[];
}

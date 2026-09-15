import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Article, Category, Author, BreakingNews, AdSlotConfig, SiteSettings, Subscriber, Comment, AdminUser, DashboardStats } from '../src/types';
import { initialArticles, initialCategories, initialAuthors, initialBreakingNews, initialAds, initialSiteSettings } from './initialData';

interface DatabaseSchema {
  articles: Article[];
  categories: Category[];
  authors: Author[];
  breakingNews: BreakingNews[];
  ads: AdSlotConfig[];
  settings: SiteSettings;
  subscribers: Subscriber[];
  comments: Comment[];
  admins: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    salt: string;
    role: 'admin' | 'editor';
  }[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'news10.json');

// Helper to hash password
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export class NewsDatabase {
  private data: DatabaseSchema;
  private recentViews: Map<string, number> = new Map(); // key: `${ip}:${articleId}`, value: timestamp

  constructor() {
    this.ensureDirectoryExists(DATA_DIR);
    this.data = this.loadDatabase();
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, initializing fresh data:', err);
      }
    }

    // Initialize with default data
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultAdminHash = hashPassword('admin123', defaultSalt);

    const initialDb: DatabaseSchema = {
      articles: initialArticles,
      categories: initialCategories,
      authors: initialAuthors,
      breakingNews: initialBreakingNews,
      ads: initialAds,
      settings: initialSiteSettings,
      subscribers: [
        { id: 'sub-1', email: 'reader@example.com', subscribedAt: '2026-09-10T12:00:00Z', active: true },
        { id: 'sub-2', email: 'editor.press@dhaka.org', subscribedAt: '2026-09-12T09:30:00Z', active: true }
      ],
      comments: [
        {
          id: 'com-1',
          articleId: 'art-1',
          authorName: 'Farhan Zahed',
          authorEmail: 'farhan@example.com',
          content: 'The reduction in travel time from Uttara to Motijheel is unprecedented. Truly remarkable engineering execution!',
          createdAt: '2026-09-14T09:00:00Z'
        }
      ],
      admins: [
        {
          id: 'admin-1',
          email: 'admin@news10.com',
          name: 'News 10 Chief Editor',
          passwordHash: defaultAdminHash,
          salt: defaultSalt,
          role: 'admin'
        }
      ]
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(dataToSave = this.data) {
    try {
      this.ensureDirectoryExists(DATA_DIR);
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  // --- ARTICLES ---
  public getArticles(filters: {
    category?: string;
    search?: string;
    authorId?: string;
    status?: string;
    featured?: boolean;
    breaking?: boolean;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'popular' | 'oldest';
  } = {}) {
    let result = [...this.data.articles];

    // Status filter
    if (filters.status) {
      result = result.filter(a => a.status === filters.status);
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const catLower = filters.category.toLowerCase();
      result = result.filter(a => a.categorySlug.toLowerCase() === catLower || a.category.toLowerCase() === catLower);
    }

    // Author filter
    if (filters.authorId) {
      result = result.filter(a => a.authorId === filters.authorId);
    }

    // Featured / Breaking filters
    if (typeof filters.featured === 'boolean') {
      result = result.filter(a => a.featured === filters.featured);
    }
    if (typeof filters.breaking === 'boolean') {
      result = result.filter(a => a.breaking === filters.breaking);
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q))) ||
        (a.seoKeywords && a.seoKeywords.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (filters.sort === 'popular') {
      result.sort((a, b) => b.views - a.views);
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    }

    const total = result.length;
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 20);
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      articles: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  public getArticleBySlug(slug: string): Article | undefined {
    return this.data.articles.find(a => a.slug === slug);
  }

  public getArticleById(id: string): Article | undefined {
    return this.data.articles.find(a => a.id === id);
  }

  public createArticle(articleData: Partial<Article>): Article {
    const id = `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    
    // Generate clean slug from title if not provided
    const baseSlug = (articleData.title || 'news-article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = articleData.slug || baseSlug;
    // ensure unique
    if (this.data.articles.some(a => a.slug === slug)) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Lookup category slug
    const cat = this.data.categories.find(c => c.name.toLowerCase() === (articleData.category || '').toLowerCase());
    const categorySlug = cat ? cat.slug : (articleData.categorySlug || 'general');

    const newArticle: Article = {
      id,
      title: articleData.title || 'Untitled Article',
      slug,
      subtitle: articleData.subtitle || '',
      excerpt: articleData.excerpt || '',
      content: articleData.content || '',
      featuredImage: articleData.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      imageCaption: articleData.imageCaption || '',
      category: articleData.category || 'Bangladesh',
      categorySlug,
      authorId: articleData.authorId || 'author-1',
      authorName: articleData.authorName || 'News 10 Staff Reporter',
      authorAvatar: articleData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      authorTitle: articleData.authorTitle || 'Staff Reporter',
      tags: articleData.tags || [],
      views: 0,
      status: articleData.status || 'published',
      featured: Boolean(articleData.featured),
      breaking: Boolean(articleData.breaking),
      categoryFeatured: Boolean(articleData.categoryFeatured),
      seoTitle: articleData.seoTitle || `${articleData.title || 'News'} | News 10`,
      seoDescription: articleData.seoDescription || articleData.excerpt || '',
      seoKeywords: articleData.seoKeywords || (articleData.tags ? articleData.tags.join(', ') : ''),
      createdAt: now,
      updatedAt: now,
      publishedAt: articleData.status === 'published' ? now : (articleData.publishedAt || now),
      youtubeUrl: articleData.youtubeUrl || ''
    };

    this.data.articles.unshift(newArticle);

    // If marked breaking, also add to breaking news ticker if requested
    if (newArticle.breaking && newArticle.status === 'published') {
      this.addBreakingNews({
        title: newArticle.title,
        link: `/news/${newArticle.categorySlug}/${newArticle.slug}`,
        active: true,
        priority: 1
      });
    }

    this.saveDatabase();
    return newArticle;
  }

  public updateArticle(id: string, updates: Partial<Article>): Article | null {
    const index = this.data.articles.findIndex(a => a.id === id);
    if (index === -1) return null;

    const existing = this.data.articles[index];
    const now = new Date().toISOString();

    // Check category slug
    let categorySlug = existing.categorySlug;
    if (updates.category && updates.category !== existing.category) {
      const cat = this.data.categories.find(c => c.name.toLowerCase() === updates.category?.toLowerCase());
      if (cat) categorySlug = cat.slug;
    }

    const updated: Article = {
      ...existing,
      ...updates,
      categorySlug,
      updatedAt: now
    };

    this.data.articles[index] = updated;
    this.saveDatabase();
    return updated;
  }

  public deleteArticle(id: string): boolean {
    const initialLen = this.data.articles.length;
    this.data.articles = this.data.articles.filter(a => a.id !== id);
    if (this.data.articles.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public incrementArticleView(id: string, clientIdentifier: string): number {
    const article = this.data.articles.find(a => a.id === id);
    if (!article) return 0;

    const viewKey = `${clientIdentifier}:${id}`;
    const lastViewed = this.recentViews.get(viewKey);
    const now = Date.now();

    // Deduplicate view counts within 3 minutes per client
    if (!lastViewed || (now - lastViewed > 3 * 60 * 1000)) {
      article.views += 1;
      this.recentViews.set(viewKey, now);
      this.saveDatabase();
    }

    return article.views;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.order - b.order);
  }

  public createCategory(cat: Partial<Category>): Category {
    const id = `cat-${(cat.slug || cat.name || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const newCat: Category = {
      id,
      name: cat.name || 'New Category',
      slug: (cat.slug || cat.name || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: cat.description || '',
      color: cat.color || '#dc2626',
      order: this.data.categories.length + 1
    };
    this.data.categories.push(newCat);
    this.saveDatabase();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return null;
    Object.assign(cat, updates);
    this.saveDatabase();
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- AUTHORS ---
  public getAuthors(): Author[] {
    return this.data.authors;
  }

  public createAuthor(authorData: Partial<Author>): Author {
    const id = `author-${Date.now()}`;
    const newAuthor: Author = {
      id,
      name: authorData.name || 'News Staff',
      title: authorData.title || 'Staff Writer',
      bio: authorData.bio || 'Journalist at News 10',
      avatar: authorData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      email: authorData.email || '',
      socialLinks: authorData.socialLinks || {}
    };
    this.data.authors.push(newAuthor);
    this.saveDatabase();
    return newAuthor;
  }

  public updateAuthor(id: string, updates: Partial<Author>): Author | null {
    const author = this.data.authors.find(a => a.id === id);
    if (!author) return null;
    Object.assign(author, updates);
    this.saveDatabase();
    return author;
  }

  public deleteAuthor(id: string): boolean {
    const initialLen = this.data.authors.length;
    this.data.authors = this.data.authors.filter(a => a.id !== id);
    if (this.data.authors.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- BREAKING NEWS ---
  public getBreakingNews(activeOnly = true): BreakingNews[] {
    let list = [...this.data.breakingNews];
    if (activeOnly) {
      list = list.filter(b => b.active);
    }
    return list.sort((a, b) => a.priority - b.priority);
  }

  public addBreakingNews(item: Partial<BreakingNews>): BreakingNews {
    const id = `bn-${Date.now()}`;
    const newItem: BreakingNews = {
      id,
      title: item.title || 'Breaking Update',
      link: item.link || '',
      active: item.active !== false,
      priority: item.priority || 1,
      createdAt: new Date().toISOString()
    };
    this.data.breakingNews.unshift(newItem);
    this.saveDatabase();
    return newItem;
  }

  public updateBreakingNews(id: string, updates: Partial<BreakingNews>): BreakingNews | null {
    const item = this.data.breakingNews.find(b => b.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.saveDatabase();
    return item;
  }

  public deleteBreakingNews(id: string): boolean {
    const initialLen = this.data.breakingNews.length;
    this.data.breakingNews = this.data.breakingNews.filter(b => b.id !== id);
    if (this.data.breakingNews.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- ADS MANAGER ---
  public getAds(): AdSlotConfig[] {
    return this.data.ads;
  }

  public updateAd(id: string, updates: Partial<AdSlotConfig>): AdSlotConfig | null {
    const ad = this.data.ads.find(a => a.id === id);
    if (!ad) return null;
    Object.assign(ad, updates);
    this.saveDatabase();
    return ad;
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- SUBSCRIBERS ---
  public addSubscriber(email: string): { success: boolean; message: string } {
    const trimmed = email.toLowerCase().trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, message: 'Invalid email address' };
    }
    const exists = this.data.subscribers.find(s => s.email === trimmed);
    if (exists) {
      return { success: true, message: 'You are already subscribed!' };
    }
    this.data.subscribers.unshift({
      id: `sub-${Date.now()}`,
      email: trimmed,
      subscribedAt: new Date().toISOString(),
      active: true
    });
    this.saveDatabase();
    return { success: true, message: 'Thank you for subscribing to News 10!' };
  }

  public getSubscribers(): Subscriber[] {
    return this.data.subscribers;
  }

  // --- COMMENTS ---
  public getComments(articleId: string): Comment[] {
    return this.data.comments
      .filter(c => c.articleId === articleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addComment(comment: { articleId: string; authorName: string; authorEmail: string; content: string }): Comment {
    const newCom: Comment = {
      id: `com-${Date.now()}`,
      articleId: comment.articleId,
      authorName: comment.authorName.trim() || 'Anonymous Reader',
      authorEmail: comment.authorEmail.trim() || '',
      content: comment.content.trim(),
      createdAt: new Date().toISOString()
    };
    this.data.comments.unshift(newCom);
    this.saveDatabase();
    return newCom;
  }

  // --- ADMIN AUTH ---
  public authenticateAdmin(email: string, passwordPlain: string): { user: AdminUser; token: string } | null {
    const admin = this.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
    if (!admin) return null;

    const computedHash = hashPassword(passwordPlain, admin.salt);
    if (computedHash !== admin.passwordHash) return null;

    // Simple deterministic signed session token
    const token = Buffer.from(JSON.stringify({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    })).toString('base64');

    return {
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      token
    };
  }

  public verifyToken(token: string): AdminUser | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (decoded.exp && decoded.exp > Date.now()) {
        const admin = this.data.admins.find(a => a.id === decoded.id);
        if (admin) {
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
          };
        }
      }
    } catch {
      // invalid token
    }
    return null;
  }

  public resetAdminPassword(email: string, newPasswordPlain: string): boolean {
    const admin = this.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
    if (!admin) return false;

    const newSalt = crypto.randomBytes(16).toString('hex');
    admin.salt = newSalt;
    admin.passwordHash = hashPassword(newPasswordPlain, newSalt);
    this.saveDatabase();
    return true;
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats(): DashboardStats {
    const totalArticles = this.data.articles.length;
    const publishedArticles = this.data.articles.filter(a => a.status === 'published').length;
    const draftArticles = this.data.articles.filter(a => a.status === 'draft').length;
    const totalViews = this.data.articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalCategories = this.data.categories.length;
    const totalAuthors = this.data.authors.length;
    const totalSubscribers = this.data.subscribers.length;

    const recentArticles = [...this.data.articles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalCategories,
      totalAuthors,
      totalSubscribers,
      recentArticles
    };
  }

  // --- RESET DEMO DATA ---
  public resetToDefaultDemo(): void {
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultAdminHash = hashPassword('admin123', defaultSalt);

    this.data = {
      articles: initialArticles,
      categories: initialCategories,
      authors: initialAuthors,
      breakingNews: initialBreakingNews,
      ads: initialAds,
      settings: initialSiteSettings,
      subscribers: [
        { id: 'sub-1', email: 'reader@example.com', subscribedAt: '2026-09-10T12:00:00Z', active: true },
        { id: 'sub-2', email: 'editor.press@dhaka.org', subscribedAt: '2026-09-12T09:30:00Z', active: true }
      ],
      comments: [
        {
          id: 'com-1',
          articleId: 'art-1',
          authorName: 'Farhan Zahed',
          authorEmail: 'farhan@example.com',
          content: 'The reduction in travel time from Uttara to Motijheel is unprecedented. Truly remarkable engineering execution!',
          createdAt: '2026-09-14T09:00:00Z'
        }
      ],
      admins: [
        {
          id: 'admin-1',
          email: 'admin@news10.com',
          name: 'News 10 Chief Editor',
          passwordHash: defaultAdminHash,
          salt: defaultSalt,
          role: 'admin'
        }
      ]
    };

    this.saveDatabase();
  }
}

export const db = new NewsDatabase();

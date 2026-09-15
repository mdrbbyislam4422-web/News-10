import { Article, Category, Author, BreakingNews, AdSlotConfig, SiteSettings, Comment, Subscriber, AdminUser, DashboardStats } from './types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('news10_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Articles
  async getArticles(params: {
    category?: string;
    search?: string;
    authorId?: string;
    status?: string;
    featured?: boolean;
    breaking?: boolean;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'popular' | 'oldest';
  } = {}): Promise<{ articles: Article[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.authorId) query.set('authorId', params.authorId);
    if (params.status) query.set('status', params.status);
    if (params.featured !== undefined) query.set('featured', String(params.featured));
    if (params.breaking !== undefined) query.set('breaking', String(params.breaking));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/articles?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticle(slugOrId: string): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slugOrId)}`);
    if (!res.ok) throw new Error('Article not found');
    return res.json();
  },

  async getArticleById(id: string): Promise<Article> {
    return this.getArticle(id);
  },

  async recordView(articleId: string): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/articles/${articleId}/view`, { method: 'POST' });
      const data = await res.json();
      return data.views || 0;
    } catch {
      return 0;
    }
  },

  async createArticle(articleData: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(articleData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create article');
    }
    return res.json();
  },

  async updateArticle(id: string, articleData: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(articleData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update article');
    }
    return res.json();
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete article');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cat)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(cat)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete category');
  },

  // Authors
  async getAuthors(): Promise<Author[]> {
    const res = await fetch(`${API_BASE}/authors`);
    if (!res.ok) throw new Error('Failed to fetch authors');
    return res.json();
  },

  async createAuthor(author: Partial<Author>): Promise<Author> {
    const res = await fetch(`${API_BASE}/authors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(author)
    });
    if (!res.ok) throw new Error('Failed to create author');
    return res.json();
  },

  async updateAuthor(id: string, author: Partial<Author>): Promise<Author> {
    const res = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(author)
    });
    if (!res.ok) throw new Error('Failed to update author');
    return res.json();
  },

  async deleteAuthor(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/authors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete author');
  },

  // Breaking News
  async getBreakingNews(all = false): Promise<BreakingNews[]> {
    const res = await fetch(`${API_BASE}/breaking-news?all=${all}`);
    if (!res.ok) throw new Error('Failed to fetch breaking news');
    return res.json();
  },

  async addBreakingNews(item: Partial<BreakingNews>): Promise<BreakingNews> {
    const res = await fetch(`${API_BASE}/breaking-news`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to add breaking news');
    return res.json();
  },

  async createBreakingNews(item: Partial<BreakingNews>): Promise<BreakingNews> {
    return this.addBreakingNews(item);
  },

  async updateBreakingNews(id: string, item: Partial<BreakingNews>): Promise<BreakingNews> {
    const res = await fetch(`${API_BASE}/breaking-news/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to update breaking news');
    return res.json();
  },

  async deleteBreakingNews(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/breaking-news/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete breaking news');
  },

  // Ads
  async getAds(): Promise<AdSlotConfig[]> {
    const res = await fetch(`${API_BASE}/ads`);
    if (!res.ok) throw new Error('Failed to fetch advertisements');
    return res.json();
  },

  async updateAd(id: string, ad: Partial<AdSlotConfig>): Promise<AdSlotConfig> {
    const res = await fetch(`${API_BASE}/ads/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(ad)
    });
    if (!res.ok) throw new Error('Failed to update ad slot');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Subscribers
  async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async getSubscribers(): Promise<Subscriber[]> {
    const res = await fetch(`${API_BASE}/subscribers`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
  },

  // Comments
  async getComments(articleId: string): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/comments/${articleId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async addComment(data: { articleId: string; authorName: string; authorEmail: string; content: string }): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to post comment');
    return res.json();
  },

  // Contact
  async sendContactMessage(data: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Upload image (base64)
  async uploadImage(base64Data: string, filename?: string): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ base64Data, filename })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload image');
    }
    return res.json();
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('news10_token', data.token);
      localStorage.setItem('news10_admin_token', data.token);
      localStorage.setItem('news10_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe(): Promise<{ user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    const token = localStorage.getItem('news10_token') || localStorage.getItem('news10_admin_token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('news10_token');
    localStorage.removeItem('news10_admin_token');
    localStorage.removeItem('news10_admin_user');
  },

  async resetPassword(arg1: string, arg2?: string): Promise<{ success: boolean; message: string }> {
    const body = arg2 ? { email: arg1, newPassword: arg2 } : { newPassword: arg1 };
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Failed to update password');
    return res.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async resetDemoData(): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/reset-demo`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
  }
};

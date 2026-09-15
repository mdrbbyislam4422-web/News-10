import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, PlusCircle, FolderTree, Users, Radio, 
  Megaphone, Settings, HelpCircle, LogOut, Search, Trash2, Edit3, 
  Eye, CheckCircle2, AlertCircle, Upload, Globe, Save, RefreshCw,
  Bold, Italic, Underline, List, ListOrdered, Quote, Link as LinkIcon, 
  Video, Image as ImageIcon, Heading1, Heading2, ExternalLink
} from 'lucide-react';
import { Article, Category, Author, BreakingNews, AdSlotConfig, SiteSettings, AdminUser, DashboardStats } from '../types';
import { api } from '../api';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onNavigateHome: () => void;
  onRefreshData: () => void;
}

type TabType = 'overview' | 'articles' | 'create-article' | 'categories' | 'authors' | 'breaking' | 'ads' | 'subscribers' | 'settings' | 'docs';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onNavigateHome,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [breakingList, setBreakingList] = useState<BreakingNews[]>([]);
  const [adsList, setAdsList] = useState<AdSlotConfig[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Article search & filter in table
  const [articleSearch, setArticleSearch] = useState('');
  const [articleCatFilter, setArticleCatFilter] = useState('all');

  // Edit or Create Article Form State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<Partial<Article>>({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category: 'Bangladesh',
    categorySlug: 'bangladesh',
    authorName: user.name,
    authorId: authors[0]?.id || 'auth-1',
    featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '',
    status: 'published',
    breaking: false,
    featured: false,
    youtubeUrl: '',
    tags: ['news', 'bangladesh'],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  // Category Modal/Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatColor, setNewCatColor] = useState('#dc2626');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Author Modal/Form
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');

  // Breaking News Form
  const [newBreakingTitle, setNewBreakingTitle] = useState('');
  const [newBreakingLink, setNewBreakingLink] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, artsData, catsData, authsData, brkData, adsData, settsData, subsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getArticles({ limit: 100 }),
        api.getCategories(),
        api.getAuthors(),
        api.getBreakingNews(true),
        api.getAds(),
        api.getSettings(),
        api.getSubscribers().catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      setArticles(artsData.articles);
      setCategories(catsData);
      setAuthors(authsData);
      setBreakingList(brkData);
      setAdsList(adsData);
      setSettings(settsData);
      setSubscribers(subsData);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Article Save / Update
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content) {
      alert('Please provide at least a title and article content.');
      return;
    }

    try {
      const catObj = categories.find(c => c.slug === articleForm.categorySlug || c.name === articleForm.category);
      const authObj = authors.find(a => a.id === articleForm.authorId) || { name: user.name, avatar: '' };

      const payload: Partial<Article> = {
        ...articleForm,
        category: catObj ? catObj.name : (articleForm.category || 'General'),
        categorySlug: catObj ? catObj.slug : (articleForm.categorySlug || 'general'),
        authorName: authObj.name,
        authorAvatar: authObj.avatar || articleForm.authorAvatar,
      };

      if (editingArticleId) {
        await api.updateArticle(editingArticleId, payload);
        notify('Article updated successfully!');
      } else {
        await api.createArticle(payload);
        notify('New article published successfully!');
      }

      // Reset form
      setEditingArticleId(null);
      setArticleForm({
        title: '',
        subtitle: '',
        excerpt: '',
        content: '',
        category: 'Bangladesh',
        categorySlug: 'bangladesh',
        authorName: user.name,
        authorId: authors[0]?.id || 'auth-1',
        featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        imageCaption: '',
        status: 'published',
        breaking: false,
        featured: false,
        youtubeUrl: '',
        tags: ['news'],
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
      });

      await loadAllData();
      onRefreshData();
      setActiveTab('articles');
    } catch (err: any) {
      alert(err.message || 'Failed to save article.');
    }
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setArticleForm({ ...art });
    setActiveTab('create-article');
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.deleteArticle(id);
      notify('Article deleted.');
      await loadAllData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article.');
    }
  };

  // Image upload simulation / local file reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await api.uploadImage(base64, file.name);
        setArticleForm(prev => ({ ...prev, featuredImage: res.url }));
        notify('Image uploaded successfully!');
      } catch {
        // Fallback to data URI if server upload fails
        setArticleForm(prev => ({ ...prev, featuredImage: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Content Toolbar insertions
  const insertContentTag = (tag: string, endTag: string = '') => {
    const current = articleForm.content || '';
    setArticleForm(prev => ({
      ...prev,
      content: `${current}\n${tag}Text here${endTag}\n`
    }));
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col transition-colors">
      {/* 1. Admin Top Nav */}
      <header className="bg-stone-900 text-white border-b border-stone-800 py-3 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer select-none" onClick={onNavigateHome}>
            <div className="bg-red-600 text-white font-black text-xl px-2 py-0.5 tracking-tighter rounded-xs">
              NEWS
            </div>
            <div className="font-black text-xl tracking-tighter text-white px-1">
              10
            </div>
          </div>
          <span className="h-4 w-px bg-stone-700 hidden sm:inline" />
          <span className="text-xs uppercase font-bold tracking-widest text-red-500 hidden sm:inline">
            Newsroom CMS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-xs bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>

          <div className="flex items-center gap-2 border-l border-stone-800 pl-4">
            <span className="text-xs font-medium text-stone-300 hidden md:inline">
              {user.name} ({user.role})
            </span>
            <button
              onClick={onLogout}
              className="p-1.5 text-stone-400 hover:text-red-400 rounded-xs transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white border border-red-600 px-4 py-3 rounded-xs shadow-2xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* 2. Admin Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-4 shrink-0">
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'articles' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Manage News</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {articles.length}
              </span>
            </button>

            <button
              onClick={() => {
                setEditingArticleId(null);
                setArticleForm({
                  title: '',
                  subtitle: '',
                  excerpt: '',
                  content: '',
                  category: 'Bangladesh',
                  categorySlug: 'bangladesh',
                  authorName: user.name,
                  authorId: authors[0]?.id || 'auth-1',
                  featuredImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
                  imageCaption: '',
                  status: 'published',
                  breaking: false,
                  featured: false,
                  youtubeUrl: '',
                  tags: ['news'],
                  seoTitle: '',
                  seoDescription: '',
                  seoKeywords: '',
                });
                setActiveTab('create-article');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'create-article' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish New Article</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'categories' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4" />
                <span>Categories</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('authors')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'authors' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Journalists & Authors</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {authors.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('breaking')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'breaking' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-red-500" />
                <span>Breaking News Ticker</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {breakingList.filter(b => b.active).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'ads' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4" />
                <span>Ads & Monetization</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {adsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'subscribers' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Newsletter Subscribers</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {subscribers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Portal Settings</span>
            </button>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setActiveTab('docs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'docs' ? 'bg-stone-900 text-white' : 'text-red-600 hover:bg-red-50 dark:hover:bg-stone-800'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-red-500" />
                <span>Setup & Deployment Guide</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                    Newsroom Performance & Metrics
                  </h2>
                  <p className="text-xs text-stone-500">Live analytics across readership and publication velocity.</p>
                </div>
                <button
                  onClick={loadAllData}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-stone-200 dark:bg-stone-800 rounded-xs hover:bg-stone-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Articles</span>
                  <div className="font-serif text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                    {articles.length}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                    {articles.filter(a => a.status === 'published').length} published • {articles.filter(a => a.status === 'draft').length} drafts
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Readership</span>
                  <div className="font-serif text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                    {stats?.totalViews.toLocaleString() || articles.reduce((acc, a) => acc + (a.views || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">Verified unique page impressions</div>
                </div>

                <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Active Desks</span>
                  <div className="font-serif text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                    {categories.length}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">{authors.length} accredited journalists</div>
                </div>

                <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Subscribers</span>
                  <div className="font-serif text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                    {subscribers.length}
                  </div>
                  <div className="text-[11px] text-red-500 mt-1">Morning digest email list</div>
                </div>
              </div>

              {/* Recent Articles & Quick Actions */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                    Recent Newsroom Dispatches
                  </h3>
                  <button
                    onClick={() => setActiveTab('create-article')}
                    className="text-xs font-bold uppercase tracking-wider text-red-600 hover:underline"
                  >
                    + Write Article
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Headline</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Author</th>
                        <th className="py-2.5 px-3">Views</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {articles.slice(0, 5).map((art) => (
                        <tr key={art.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                          <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100 max-w-xs truncate">
                            {art.title}
                          </td>
                          <td className="py-3 px-3 text-stone-500">{art.category}</td>
                          <td className="py-3 px-3 text-stone-500">{art.authorName}</td>
                          <td className="py-3 px-3 font-mono font-medium">{art.views}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              art.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {art.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleEditArticle(art)}
                              className="text-stone-600 hover:text-red-600 mr-2"
                              title="Edit Article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="text-stone-400 hover:text-rose-600"
                              title="Delete Article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MANAGE ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                    Manage All News Articles
                  </h2>
                  <p className="text-xs text-stone-500">Filter, edit, publish, or purge articles from the repository.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingArticleId(null);
                    setActiveTab('create-article');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs self-start"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Article</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-stone-900 p-3 rounded-sm border border-stone-200 dark:border-stone-800">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Search by title or author..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xs"
                  />
                </div>
                <select
                  value={articleCatFilter}
                  onChange={(e) => setArticleCatFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xs"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Articles Table */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 text-stone-500 uppercase text-[10px]">
                        <th className="py-3 px-4">Thumbnail</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Author</th>
                        <th className="py-3 px-4">Views</th>
                        <th className="py-3 px-4">Badges</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {articles
                        .filter(a => {
                          const matchesQuery = a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
                                              a.authorName.toLowerCase().includes(articleSearch.toLowerCase());
                          const matchesCat = articleCatFilter === 'all' || a.categorySlug === articleCatFilter;
                          return matchesQuery && matchesCat;
                        })
                        .map((art) => (
                          <tr key={art.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                            <td className="py-3 px-4 w-16">
                              <img
                                src={art.featuredImage}
                                alt={art.title}
                                className="w-12 h-9 object-cover rounded-xs"
                              />
                            </td>
                            <td className="py-3 px-4 font-serif font-bold text-stone-900 dark:text-stone-100 max-w-sm truncate">
                              {art.title}
                            </td>
                            <td className="py-3 px-4 text-stone-500">{art.category}</td>
                            <td className="py-3 px-4 text-stone-500">{art.authorName}</td>
                            <td className="py-3 px-4 font-mono font-bold text-red-600">{art.views}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                {art.breaking && <span className="bg-red-600 text-white text-[9px] px-1 rounded-xs uppercase font-bold">Breaking</span>}
                                {art.featured && <span className="bg-amber-600 text-white text-[9px] px-1 rounded-xs uppercase font-bold">Featured</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                art.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-stone-200 text-stone-700'
                              }`}>
                                {art.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleEditArticle(art)}
                                className="p-1.5 text-stone-600 hover:text-red-600 cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(art.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer ml-1"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CREATE / EDIT ARTICLE */}
          {activeTab === 'create-article' && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm p-6 shadow-md">
              <div className="pb-4 mb-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                    {editingArticleId ? 'Edit News Article' : 'Compose & Publish News'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Draft professional news reports with formatting, rich media, and SEO attributes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('articles')}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={articleForm.title || ''}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="Enter engaging, objective news headline..."
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs font-serif font-bold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                </div>

                {/* Subtitle / Excerpt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Subtitle / Deck
                    </label>
                    <input
                      type="text"
                      value={articleForm.subtitle || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, subtitle: e.target.value })}
                      placeholder="Contextual subtitle..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Short Excerpt (for cards & social)
                    </label>
                    <input
                      type="text"
                      value={articleForm.excerpt || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                      placeholder="1-2 sentences summary..."
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    />
                  </div>
                </div>

                {/* Category & Author Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={articleForm.categorySlug || 'bangladesh'}
                      onChange={(e) => {
                        const selected = categories.find(c => c.slug === e.target.value);
                        setArticleForm({
                          ...articleForm,
                          categorySlug: e.target.value,
                          category: selected ? selected.name : e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Author / Journalist
                    </label>
                    <select
                      value={articleForm.authorId || authors[0]?.id}
                      onChange={(e) => {
                        const selected = authors.find(a => a.id === e.target.value);
                        setArticleForm({
                          ...articleForm,
                          authorId: e.target.value,
                          authorName: selected ? selected.name : user.name
                        });
                      }}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    >
                      {authors.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Publication Status
                    </label>
                    <select
                      value={articleForm.status || 'published'}
                      onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs font-bold"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft (Unlisted)</option>
                    </select>
                  </div>
                </div>

                {/* Featured Image URL / Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Featured Image URL or Upload *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      value={articleForm.featuredImage || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, featuredImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    />
                    <label className="bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 px-4 py-2 text-xs font-semibold rounded-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {articleForm.featuredImage && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={articleForm.featuredImage}
                        alt="Preview"
                        className="w-20 h-14 object-cover rounded-xs border border-stone-300"
                      />
                      <input
                        type="text"
                        value={articleForm.imageCaption || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, imageCaption: e.target.value })}
                        placeholder="Caption: e.g. Photo: News 10 Bureau / Ministry of Transport"
                        className="flex-1 px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Rich-Text Formatting Toolbar & Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Article Content (HTML supported) *
                    </label>
                    <span className="text-[11px] text-stone-400">Toolbar inserts clean HTML tags</span>
                  </div>

                  {/* Formatting Buttons */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-200 dark:bg-stone-800 border border-b-0 border-stone-300 dark:border-stone-700 rounded-t-xs">
                    <button
                      type="button"
                      onClick={() => insertContentTag('<h2>', '</h2>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs text-xs font-bold flex items-center gap-0.5 px-2"
                      title="Heading 2"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                      <span>H2</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<h3>', '</h3>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs text-xs font-bold flex items-center gap-0.5 px-2"
                      title="Heading 3"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                      <span>H3</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<strong>', '</strong>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs px-2"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<em>', '</em>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs px-2"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<u>', '</u>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs px-2"
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<ul>\n  <li>', '</li>\n  <li>Second point</li>\n</ul>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs px-2"
                      title="Bullet list"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<ol>\n  <li>', '</li>\n  <li>Step 2</li>\n</ol>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs px-2"
                      title="Numbered list"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<blockquote>', '</blockquote>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs px-2"
                      title="Quote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag('<p>', '</p>')}
                      className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded-xs px-2 text-xs font-mono font-bold"
                      title="Paragraph"
                    >
                      &para; Paragraph
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    required
                    value={articleForm.content || ''}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    placeholder="Type or paste the full article content here. You can use standard paragraphs or HTML..."
                    className="w-full p-4 text-sm font-serif bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-b-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                </div>

                {/* Embedded YouTube video URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    YouTube Video URL (Optional Embed)
                  </label>
                  <div className="relative">
                    <Video className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={articleForm.youtubeUrl || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    />
                  </div>
                </div>

                {/* Breaking & Featured Toggles */}
                <div className="p-4 bg-stone-50 dark:bg-stone-950/60 rounded-xs border border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={articleForm.breaking || false}
                      onChange={(e) => setArticleForm({ ...articleForm, breaking: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded-xs focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-red-600 uppercase">
                      Mark as Breaking News
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={articleForm.featured || false}
                      onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded-xs focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase">
                      Feature on Homepage Top Hero
                    </span>
                  </label>
                </div>

                {/* SEO Optimization Fields */}
                <div className="p-4 bg-stone-50 dark:bg-stone-950/60 rounded-xs border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="text-xs uppercase font-extrabold text-stone-700 dark:text-stone-300">
                    SEO Metadata & Search Engine Indexing
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-500 mb-1">Custom SEO Title</label>
                      <input
                        type="text"
                        value={articleForm.seoTitle || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, seoTitle: e.target.value })}
                        placeholder="Default matches headline..."
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-500 mb-1">Keywords (comma separated)</label>
                      <input
                        type="text"
                        value={articleForm.seoKeywords || ''}
                        onChange={(e) => setArticleForm({ ...articleForm, seoKeywords: e.target.value })}
                        placeholder="bangladesh, economy, inflation..."
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={articleForm.seoDescription || ''}
                      onChange={(e) => setArticleForm({ ...articleForm, seoDescription: e.target.value })}
                      placeholder="Brief summary for Google search result snippets (150-160 chars recommended)..."
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xs"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingArticleId ? 'Update & Sync Article' : 'Publish Article Live'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Category Management
                </h2>
                <p className="text-xs text-stone-500">Configure editorial sections displayed across the navigation bar.</p>
              </div>

              {/* Add Category Form */}
              <div className="bg-white dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
                  Add New News Section
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Science)"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                  <input
                    type="text"
                    placeholder="Slug (e.g. science)"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-9 h-8 rounded-xs cursor-pointer border border-stone-300"
                    />
                    <span className="text-xs font-mono text-stone-500">{newCatColor}</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!newCatName) return;
                      await api.createCategory({ name: newCatName, slug: newCatSlug, color: newCatColor });
                      setNewCatName('');
                      setNewCatSlug('');
                      notify('Category added!');
                      loadAllData();
                      onRefreshData();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-xs cursor-pointer"
                  >
                    Add Category
                  </button>
                </div>
              </div>

              {/* Categories list */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase text-[10px]">
                      <th className="py-2.5 px-4">Color</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Slug</th>
                      <th className="py-2.5 px-4">Articles</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {categories.map((c) => {
                      const count = articles.filter(a => a.categorySlug === c.slug).length;
                      return (
                        <tr key={c.id}>
                          <td className="py-2.5 px-4">
                            <span className="w-4 h-4 rounded-xs inline-block" style={{ backgroundColor: c.color || '#dc2626' }} />
                          </td>
                          <td className="py-2.5 px-4 font-bold text-stone-900 dark:text-white">{c.name}</td>
                          <td className="py-2.5 px-4 font-mono text-stone-500">{c.slug}</td>
                          <td className="py-2.5 px-4 font-semibold">{count}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={async () => {
                                if (confirm(`Delete category "${c.name}"?`)) {
                                  await api.deleteCategory(c.id);
                                  notify('Category deleted.');
                                  loadAllData();
                                  onRefreshData();
                                }
                              }}
                              className="text-stone-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: AUTHORS */}
          {activeTab === 'authors' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Journalists & Editorial Team
                </h2>
                <p className="text-xs text-stone-500">Manage reporters, columnists, and desk correspondents.</p>
              </div>

              {/* Add Author */}
              <div className="bg-white dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
                  Add New Journalist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Journalist Name"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Chief Political Correspondent)"
                    value={newAuthorRole}
                    onChange={(e) => setNewAuthorRole(e.target.value)}
                    className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                  <input
                    type="url"
                    placeholder="Avatar Image URL"
                    value={newAuthorAvatar}
                    onChange={(e) => setNewAuthorAvatar(e.target.value)}
                    className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!newAuthorName) return;
                    await api.createAuthor({
                      name: newAuthorName,
                      role: newAuthorRole || 'Staff Writer',
                      avatar: newAuthorAvatar,
                      bio: 'Senior journalist at News 10.'
                    });
                    setNewAuthorName('');
                    setNewAuthorRole('');
                    notify('Author registered!');
                    loadAllData();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-xs cursor-pointer"
                >
                  Register Journalist
                </button>
              </div>

              {/* Authors List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {authors.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900 dark:text-white">{a.name}</div>
                        <div className="text-[11px] text-stone-500">{a.role}</div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (confirm(`Remove journalist ${a.name}?`)) {
                          await api.deleteAuthor(a.id);
                          notify('Author removed.');
                          loadAllData();
                        }
                      }}
                      className="text-stone-400 hover:text-rose-600 cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BREAKING NEWS */}
          {activeTab === 'breaking' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Breaking News Ticker Broadcast
                </h2>
                <p className="text-xs text-stone-500">
                  Control the real-time ticker stream running across the top of the portal.
                </p>
              </div>

              {/* Add Breaking */}
              <div className="bg-white dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800 rounded-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
                  Broadcast New Breaking Item
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Breaking headline..."
                    value={newBreakingTitle}
                    onChange={(e) => setNewBreakingTitle(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                  <input
                    type="text"
                    placeholder="Article link (optional)"
                    value={newBreakingLink}
                    onChange={(e) => setNewBreakingLink(e.target.value)}
                    className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!newBreakingTitle) return;
                    await api.createBreakingNews({ title: newBreakingTitle, link: newBreakingLink, active: true });
                    setNewBreakingTitle('');
                    setNewBreakingLink('');
                    notify('Breaking news published to live ticker!');
                    loadAllData();
                    onRefreshData();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-xs cursor-pointer"
                >
                  Broadcast Headline
                </button>
              </div>

              {/* Breaking List */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm divide-y divide-stone-100 dark:divide-stone-800">
                {breakingList.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-red-600 animate-ping' : 'bg-stone-400'}`} />
                        <span className="font-semibold text-xs text-stone-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      {item.link && (
                        <span className="text-[11px] text-stone-400 font-mono mt-0.5 block truncate max-w-sm">
                          {item.link}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          await api.updateBreakingNews(item.id, { active: !item.active });
                          notify(`Ticker item ${item.active ? 'paused' : 'activated'}.`);
                          loadAllData();
                          onRefreshData();
                        }}
                        className={`text-xs px-2.5 py-1 rounded-xs font-bold uppercase ${
                          item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {item.active ? 'Active' : 'Inactive'}
                      </button>

                      <button
                        onClick={async () => {
                          await api.deleteBreakingNews(item.id);
                          notify('Item deleted.');
                          loadAllData();
                          onRefreshData();
                        }}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ADVERTISEMENT MANAGEMENT */}
          {activeTab === 'ads' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Advertisement Areas & Monetization
                </h2>
                <p className="text-xs text-stone-500">
                  Manage third-party ad networks, CPM scripts, 728x90 banner codes, and toggle slots on/off.
                </p>
              </div>

              <div className="space-y-4">
                {adsList.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                          <span>{ad.name}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-xs text-stone-600 dark:text-stone-400">
                            Location: {ad.location}
                          </span>
                        </h4>
                        <span className="text-xs text-stone-500">
                          Target Size: {ad.width}x{ad.height}
                        </span>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={ad.enabled}
                          onChange={async (e) => {
                            await api.updateAd(ad.id, { enabled: e.target.checked });
                            notify(`Ad slot ${ad.name} ${e.target.checked ? 'enabled' : 'disabled'}`);
                            loadAllData();
                          }}
                          className="w-4 h-4 text-red-600 rounded-xs"
                        />
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          {ad.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">
                        Ad Script / HTML Code:
                      </label>
                      <textarea
                        rows={4}
                        defaultValue={ad.scriptCode || ''}
                        onBlur={async (e) => {
                          if (e.target.value !== ad.scriptCode) {
                            await api.updateAd(ad.id, { scriptCode: e.target.value });
                            notify('Ad script code updated.');
                          }
                        }}
                        className="w-full font-mono text-[11px] p-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xs text-stone-800 dark:text-stone-200 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Changes auto-save when you click away from this field.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Morning Digest Newsletter Subscribers ({subscribers.length})
                </h2>
                <p className="text-xs text-stone-500">Registered readers receiving news alerts.</p>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 uppercase text-[10px]">
                      <th className="py-2.5 px-4">Email Address</th>
                      <th className="py-2.5 px-4">Date Subscribed</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {subscribers.map((s) => (
                      <tr key={s.id}>
                        <td className="py-3 px-4 font-mono font-medium text-stone-900 dark:text-stone-100">{s.email}</td>
                        <td className="py-3 px-4 text-stone-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Website Identity & Contact Information
                </h2>
                <p className="text-xs text-stone-500">Configure core metadata, addresses, and social channels.</p>
              </div>

              <div className="bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Editorial Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                      Telephone
                    </label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Newsroom Physical Address
                  </label>
                  <input
                    type="text"
                    value={settings.contactAddress}
                    onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
                  />
                </div>

                <button
                  onClick={async () => {
                    await api.updateSettings(settings);
                    notify('Settings saved successfully!');
                    onRefreshData();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xs cursor-pointer"
                >
                  Save Portal Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB: SETUP & DEPLOYMENT GUIDE (Prompt #31) */}
          {activeTab === 'docs' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  News 10 — Production Setup & Architecture Guide
                </h2>
                <p className="text-xs text-stone-500">
                  Comprehensive documentation on setting up Firebase, deployments, ads scripts, and branding.
                </p>
              </div>

              <div className="space-y-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                {/* 1. Firebase Integration */}
                <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">1</span>
                    <span>Firebase Firestore, Authentication & Cloud Storage</span>
                  </h3>
                  <p className="mb-3">
                    News 10 is designed with a swappable database adapter in <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded-xs font-mono">server/db.ts</code>. To link an external Firebase project:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    <li>Create a project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-red-600 underline">console.firebase.google.com</a>.</li>
                    <li>Provision <strong>Cloud Firestore</strong> database in test or production mode.</li>
                    <li>Enable <strong>Email/Password Authentication</strong> in the Firebase Console.</li>
                    <li>Generate a Service Account Private Key (JSON) from <em>Project Settings &gt; Service Accounts</em>.</li>
                    <li>Store your credentials in environment variables <code className="bg-stone-100 dark:bg-stone-800 px-1 font-mono">FIREBASE_PROJECT_ID</code>, <code className="bg-stone-100 dark:bg-stone-800 px-1 font-mono">FIREBASE_CLIENT_EMAIL</code>, and <code className="bg-stone-100 dark:bg-stone-800 px-1 font-mono">FIREBASE_PRIVATE_KEY</code>.</li>
                  </ol>
                </div>

                {/* 2. Logo & Branding Customization */}
                <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">2</span>
                    <span>How to Change the Logo and Brand Assets</span>
                  </h3>
                  <p className="mb-2">
                    The portal provides two ways to customize the logo:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Custom Vector Logo:</strong> The standard logo is generated using high-contrast newspaper typography with a red accent block in <code className="bg-stone-100 dark:bg-stone-800 px-1 font-mono">src/components/Header.tsx</code>.</li>
                    <li><strong>Custom PNG/SVG Logo:</strong> In <em>Portal Settings</em>, you can specify an image logo URL which will replace the typographic emblem automatically.</li>
                  </ul>
                </div>

                {/* 3. Advertisement Codes & CPM Networks */}
                <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">3</span>
                    <span>Managing Third-Party Advertisement Scripts</span>
                  </h3>
                  <p className="mb-2">
                    The application includes the required scripts pre-loaded into the <strong>Ads & Monetization</strong> manager:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-mono text-[11px]">
                    <li><strong>Top Header Ad:</strong> <span className="text-stone-500">https://pl29279007.profitableratecpmnetwork.com/3d/59/0f/3d590f674264a04822fac047b49aba87.js</span></li>
                    <li><strong>728x90 Banner Ad:</strong> <span className="text-stone-500">atOptions iframe + https://www.highrevenueformat.com/b7534e8d2958963ef91793a595d84149/invoke.js</span></li>
                    <li><strong>Additional Slot:</strong> <span className="text-stone-500">https://pl29279009.profitableratecpmnetwork.com/1f/68/4b/1f684bb7bce6298ed94bde67a620c594.js</span></li>
                  </ul>
                  <p className="mt-2 text-stone-600 dark:text-stone-400">
                    All ads run through the isolated <code className="bg-stone-100 dark:bg-stone-800 px-1 font-mono">&lt;AdSlot /&gt;</code> container with responsive scaling to ensure mobile readers never experience horizontal layout breaks.
                  </p>
                </div>

                {/* 4. Adding New Categories */}
                <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">4</span>
                    <span>Adding Categories and Editorial Desks</span>
                  </h3>
                  <p>
                    Go to the <strong>Categories</strong> tab on the sidebar. Enter a category name (e.g., "Investigation" or "World Cup"), assign an accent color, and click "Add Category". It will instantly become available in the navigation bar, homepage sections, and article composer.
                  </p>
                </div>

                {/* 5. Production Build & Deployment */}
                <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">5</span>
                    <span>Production Build & Cloud Run / VPS Deployment</span>
                  </h3>
                  <p className="mb-2">Run the standard production commands:</p>
                  <pre className="bg-stone-900 text-stone-100 p-3 rounded-xs font-mono text-[11px] overflow-x-auto">
{`npm run build
npm start`}
                  </pre>
                  <p className="mt-2">
                    In production, Express automatically serves optimized frontend assets from the <code className="bg-stone-100 dark:bg-stone-800 px-1 font-mono">dist/</code> directory and handles API routes on port 3000.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

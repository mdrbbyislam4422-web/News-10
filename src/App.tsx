import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { LatestPage } from './pages/LatestPage';
import { SearchPage } from './pages/SearchPage';
import { StaticPage } from './pages/StaticPages';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { api } from './api';
import { Article, Category, Author, BreakingNews, SiteSettings, AdminUser } from './types';

export function App() {
  // Navigation Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('news10_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('news10_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('news10_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Global Portal Data
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync route with browser navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigation handler
  const handleNavigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Article selection handler
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    const catSlug = article.categorySlug || article.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    handleNavigate(`/news/${catSlug}/${article.slug}`);
  };

  // Load all initial portal data
  const loadData = async () => {
    try {
      const [articlesData, categoriesData, authorsData, breakingData, settingsData] = await Promise.all([
        api.getArticles({ limit: 40 }),
        api.getCategories(),
        api.getAuthors(),
        api.getBreakingNews(),
        api.getSettings().catch(() => null)
      ]);

      setArticles(articlesData.articles);
      setCategories(categoriesData);
      setAuthors(authorsData);
      setBreakingNews(breakingData);
      if (settingsData) setSettings(settingsData);

      // Check current admin session
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching initial news portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Resolve active article when opening a direct /news/:cat/:slug URL
  useEffect(() => {
    if (currentPath.startsWith('/news/')) {
      const cleanPath = currentPath.split('?')[0];
      const parts = cleanPath.split('/').filter(Boolean);
      const articleSlug = parts[parts.length - 1];

      if (articleSlug) {
        // Find in loaded articles or fetch from API
        const found = articles.find(a => a.slug === articleSlug || a.id === articleSlug);
        if (found) {
          setSelectedArticle(found);
        } else {
          api.getArticle(articleSlug)
            .then(art => setSelectedArticle(art))
            .catch(err => console.warn('Could not load article for slug:', articleSlug, err));
        }
      }
    }
  }, [currentPath, articles]);

  // Route match helpers
  const pathname = currentPath.split('?')[0];
  const isHome = pathname === '/';
  const isLatest = pathname === '/latest';
  const isCategory = pathname.startsWith('/category/');
  const isArticle = pathname.startsWith('/news/');
  const isSearch = pathname.startsWith('/search');
  const isAdmin = pathname.startsWith('/admin');
  const isAbout = pathname === '/about';
  const isContact = pathname === '/contact';
  const isPrivacy = pathname === '/privacy';
  const isTerms = pathname === '/terms';
  const isDisclaimer = pathname === '/disclaimer';

  // Category slug extraction
  const categorySlug = isCategory ? pathname.replace('/category/', '').toLowerCase() : '';

  // Search query extraction
  const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');
  const searchQuery = searchParams.get('q') || '';

  // Render Admin View
  if (isAdmin) {
    if (!currentUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            handleNavigate('/admin');
          }}
          onNavigateHome={() => handleNavigate('/')}
        />
      );
    }

    return (
      <AdminDashboard
        user={currentUser}
        onLogout={() => {
          api.logout();
          setCurrentUser(null);
          handleNavigate('/');
        }}
        onNavigateHome={() => handleNavigate('/')}
        onRefreshData={loadData}
      />
    );
  }

  // Loading Screen for First Render
  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200">
        <div className="flex items-center space-x-2 mb-4">
          <span className="font-serif font-black text-3xl tracking-tight text-stone-900 dark:text-white uppercase">NEWS</span>
          <span className="px-2 py-0.5 bg-red-600 text-white font-black text-3xl rounded-sm">10</span>
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-3" />
        <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Transmitting Editorial Wire...</p>
      </div>
    );
  }

  // Render Public News Portal
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F8] text-stone-900 dark:bg-stone-950 dark:text-stone-100 font-sans transition-colors duration-200 selection:bg-red-600 selection:text-white">
      {/* Newspaper Masthead & Navigation */}
      <Header
        categories={categories}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Newspaper Body Content */}
      <main className="flex-1 w-full">
        {isHome && (
          <HomePage
            articles={articles}
            categories={categories}
            breakingNews={breakingNews}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {isLatest && (
          <LatestPage
            articles={articles}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {isCategory && (
          <CategoryPage
            categorySlug={categorySlug}
            categories={categories}
            articles={articles}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {isArticle && selectedArticle && (
          <ArticlePage
            article={selectedArticle}
            allArticles={articles}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {isArticle && !selectedArticle && !loading && (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="font-serif text-3xl font-bold mb-4 text-stone-900 dark:text-white">Story Not Found</h1>
            <p className="text-stone-500 mb-6">The requested article could not be retrieved from the News 10 archives.</p>
            <button
              onClick={() => handleNavigate('/')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
            >
              Return to Front Page
            </button>
          </div>
        )}

        {isSearch && (
          <SearchPage
            initialQuery={searchQuery}
            articles={articles}
            categories={categories}
            authors={authors}
            onSelectArticle={handleSelectArticle}
            onNavigate={handleNavigate}
          />
        )}

        {isAbout && <StaticPage type="about" onNavigate={handleNavigate} />}
        {isContact && <StaticPage type="contact" onNavigate={handleNavigate} />}
        {isPrivacy && <StaticPage type="privacy" onNavigate={handleNavigate} />}
        {isTerms && <StaticPage type="terms" onNavigate={handleNavigate} />}
        {isDisclaimer && <StaticPage type="disclaimer" onNavigate={handleNavigate} />}
      </main>

      {/* Professional Newspaper Footer */}
      <Footer
        categories={categories}
        settings={settings}
        navigate={handleNavigate}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;

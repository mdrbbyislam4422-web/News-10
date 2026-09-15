import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Article, Category, Author } from '../types';
import { NewsCard } from '../components/NewsCard';
import { SEOHead } from '../components/SEOHead';
import { AdSlot } from '../components/AdSlot';

interface SearchPageProps {
  initialQuery?: string;
  articles: Article[];
  categories: Category[];
  authors: Author[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  articles,
  categories,
  authors,
  onSelectArticle,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Filter logic across headline, category, keywords/tags, author
  const filtered = articles.filter(a => {
    if (a.status !== 'published') return false;

    // Category filter
    if (selectedCategory !== 'all') {
      if (a.categorySlug.toLowerCase() !== selectedCategory.toLowerCase() &&
          a.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }

    // Author filter
    if (selectedAuthor !== 'all') {
      if (a.authorId !== selectedAuthor && a.authorName !== selectedAuthor) {
        return false;
      }
    }

    // Text search query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchExcerpt = a.excerpt.toLowerCase().includes(q);
      const matchCat = a.category.toLowerCase().includes(q);
      const matchAuthor = a.authorName.toLowerCase().includes(q);
      const matchTags = a.tags && a.tags.some(t => t.toLowerCase().includes(q));
      const matchKeywords = a.seoKeywords && a.seoKeywords.toLowerCase().includes(q);

      return matchTitle || matchExcerpt || matchCat || matchAuthor || matchTags || matchKeywords;
    }

    return true;
  });

  // Sort
  if (sortBy === 'popular') {
    filtered.sort((a, b) => b.views - a.views);
  } else {
    filtered.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedArticles = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead
        title={query ? `Search Results for "${query}" - News 10` : 'Search News - News 10'}
        description="Search news articles across all categories, journalists and topics on News 10."
      />

      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-stone-900 dark:text-white uppercase mb-3">
          News 10 Search
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Find headlines, investigative reports, policy analyses and sports coverage.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, headline, topic or journalist..."
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-sm text-sm focus:outline-hidden focus:ring-2 focus:ring-red-600 text-stone-900 dark:text-stone-100 shadow-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-sm transition-colors cursor-pointer shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Toolbar */}
        <div className="mt-4 flex items-center justify-center flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 px-3 py-1.5 rounded-xs border border-stone-200 dark:border-stone-800">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-stone-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-stone-800 dark:text-stone-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 px-3 py-1.5 rounded-xs border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 font-medium">Author:</span>
            <select
              value={selectedAuthor}
              onChange={(e) => { setSelectedAuthor(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-stone-800 dark:text-stone-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Journalists</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 px-3 py-1.5 rounded-xs border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-800 dark:text-stone-200 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Most Recent</option>
              <option value="popular">Most Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
        <span>Found <strong>{filtered.length}</strong> matching articles</span>
        {query && <span>Query: <span className="text-red-600 font-semibold">"{query}"</span></span>}
      </div>

      {/* Results Grid */}
      {paginatedArticles.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-stone-900/40 rounded-sm border border-stone-200 dark:border-stone-800">
          <p className="text-stone-500 text-sm font-medium">
            No matching articles found. Try searching for broader terms or clearing your filters.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => { setQuery(''); setSelectedCategory('all'); setSelectedAuthor('all'); }}
              className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-xs text-xs font-bold uppercase hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {paginatedArticles.map((art) => (
            <NewsCard
              key={art.id}
              article={art}
              variant="standard"
              onClick={() => onSelectArticle(art)}
            />
          ))}
        </div>
      )}

      {/* Ad slot */}
      <AdSlot location="banner" className="my-8" />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-stone-300 dark:border-stone-700 rounded-xs disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xs text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-red-600 text-white'
                    : 'border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-stone-300 dark:border-stone-700 rounded-xs disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

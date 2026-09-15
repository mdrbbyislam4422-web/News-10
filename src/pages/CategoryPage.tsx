import React, { useState } from 'react';
import { Article, Category } from '../types';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';
import { SEOHead } from '../components/SEOHead';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
  categories: Category[];
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  categories,
  articles,
  onSelectArticle,
  onNavigate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const itemsPerPage = 8;

  const currentCategory = categories.find(
    c => c.slug.toLowerCase() === categorySlug.toLowerCase()
  ) || {
    id: categorySlug,
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    slug: categorySlug,
    description: `All latest news reports, analyses and updates in ${categorySlug}.`,
    color: '#dc2626',
    order: 99
  };

  // Filter articles
  let filtered = articles.filter(
    a => a.status === 'published' &&
    (a.categorySlug.toLowerCase() === categorySlug.toLowerCase() ||
     a.category.toLowerCase() === currentCategory.name.toLowerCase())
  );

  // Sorting
  if (sortBy === 'popular') {
    filtered.sort((a, b) => b.views - a.views);
  } else {
    filtered.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedArticles = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SEOHead
        title={`${currentCategory.name} News - News 10`}
        description={currentCategory.description || `Read comprehensive breaking ${currentCategory.name} news from News 10.`}
      />

      {/* Category Header Banner */}
      <div className="mb-8 pb-4 border-b-2 border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <button onClick={() => onNavigate('/')} className="hover:text-red-600">Home</button>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200 font-semibold">{currentCategory.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-8 rounded-xs"
                style={{ backgroundColor: currentCategory.color || '#dc2626' }}
              />
              <h1 className="font-serif text-3xl sm:text-4xl font-black uppercase text-stone-900 dark:text-white tracking-tight">
                {currentCategory.name}
              </h1>
            </div>
            {currentCategory.description && (
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-2xl">
                {currentCategory.description}
              </p>
            )}
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 px-2 py-1 rounded-xs text-stone-800 dark:text-stone-200 text-xs focus:outline-hidden"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Banner Ad */}
      <AdSlot location="banner" className="mb-8" />

      {/* Articles Grid */}
      {paginatedArticles.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 dark:bg-stone-900/40 rounded-sm border border-stone-200 dark:border-stone-800">
          <p className="text-stone-500 text-sm font-medium">No articles currently published in this section.</p>
          <button
            onClick={() => onNavigate('/')}
            className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase rounded-xs hover:bg-red-700 transition-colors"
          >
            Return to Homepage
          </button>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-stone-300 dark:border-stone-700 rounded-xs disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
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
            className="p-2 border border-stone-300 dark:border-stone-700 rounded-xs disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

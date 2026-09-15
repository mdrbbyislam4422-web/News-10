import React, { useState } from 'react';
import { Article } from '../types';
import { NewsCard } from '../components/NewsCard';
import { AdSlot } from '../components/AdSlot';
import { SEOHead } from '../components/SEOHead';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface LatestPageProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (path: string) => void;
}

export const LatestPage: React.FC<LatestPageProps> = ({
  articles,
  onSelectArticle,
  onNavigate,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const published = articles
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

  const totalPages = Math.ceil(published.length / itemsPerPage) || 1;
  const paginatedArticles = published.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead
        title="Latest News Wire - News 10"
        description="Continuous live feed of the newest stories, alerts, and investigative reports."
      />

      <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <button onClick={() => onNavigate('/')} className="hover:text-red-600">Home</button>
            <span>/</span>
            <span className="text-stone-800 dark:text-stone-200 font-semibold">Latest News</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-600" />
            <h1 className="font-serif text-3xl font-black uppercase text-stone-900 dark:text-white tracking-tight">
              Latest News Wire
            </h1>
          </div>
        </div>

        <span className="text-xs text-stone-500 font-medium hidden sm:inline">
          Updated 24/7 in real-time
        </span>
      </div>

      <AdSlot location="top" className="mb-6" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {paginatedArticles.map((art) => (
          <NewsCard
            key={art.id}
            article={art}
            variant="standard"
            onClick={() => onSelectArticle(art)}
          />
        ))}
      </div>

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

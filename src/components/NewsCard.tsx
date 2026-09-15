import React from 'react';
import { Eye, Clock, User } from 'lucide-react';
import { Article } from '../types';

interface NewsCardProps {
  article: Article;
  variant?: 'lead' | 'standard' | 'compact' | 'horizontal';
  onClick: () => void;
  priority?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  variant = 'standard',
  onClick,
}) => {
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 60) return `${Math.max(1, mins)}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  // 1. LEAD HERO VARIANT
  if (variant === 'lead') {
    return (
      <article
        id={`lead-article-${article.id}`}
        onClick={onClick}
        className="group cursor-pointer flex flex-col justify-between bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden hover:border-red-500/50 dark:hover:border-red-500/50 transition-all shadow-xs"
      >
        <div className="relative aspect-16/9 sm:aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={article.featuredImage}
            alt={article.title}
            loading="eager"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-xs shadow-xs">
              {article.category}
            </span>
            {article.breaking && (
              <span className="bg-stone-900 text-white font-bold text-xs uppercase tracking-wider px-2 py-1 rounded-xs flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Breaking
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
              {article.title}
            </h2>
            <p className="mt-2.5 text-stone-600 dark:text-stone-300 text-sm sm:text-base line-clamp-3 leading-relaxed">
              {article.excerpt || article.subtitle}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2">
              {article.authorAvatar ? (
                <img
                  src={article.authorAvatar}
                  alt={article.authorName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-stone-400" />
              )}
              <span className="font-semibold text-stone-700 dark:text-stone-300">{article.authorName}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimeAgo(article.publishedAt || article.createdAt)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. HORIZONTAL VARIANT (great for lists & sidebars)
  if (variant === 'horizontal') {
    return (
      <article
        id={`card-h-${article.id}`}
        onClick={onClick}
        className="group cursor-pointer flex gap-3.5 p-3 bg-white dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800/80 rounded-sm hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-all"
      >
        <div className="w-24 sm:w-28 h-20 sm:h-22 shrink-0 overflow-hidden rounded-xs bg-stone-100 dark:bg-stone-800">
          <img
            src={article.featuredImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider">
                {article.category}
              </span>
              <span className="text-[10px] text-stone-400">
                {formatTimeAgo(article.publishedAt || article.createdAt)}
              </span>
            </div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
              {article.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
            <span className="truncate">{article.authorName}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              <span>{article.views}</span>
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 3. COMPACT VARIANT (Text-first for side columns)
  if (variant === 'compact') {
    return (
      <article
        id={`card-compact-${article.id}`}
        onClick={onClick}
        className="group cursor-pointer py-3 border-b border-stone-200 dark:border-stone-800 last:border-none"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider">
            {article.category}
          </span>
          <span className="text-[10px] text-stone-400">
            {formatTimeAgo(article.publishedAt || article.createdAt)}
          </span>
        </div>
        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1.5">
          <span>{article.authorName}</span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            <span>{article.views} views</span>
          </span>
        </div>
      </article>
    );
  }

  // 4. STANDARD GRID CARD
  return (
    <article
      id={`card-std-${article.id}`}
      onClick={onClick}
      className="group cursor-pointer flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden hover:border-red-500/40 dark:hover:border-red-500/40 transition-all shadow-xs"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={article.featuredImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
        />
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-red-600 text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {article.title}
          </h3>
          <p className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <span className="truncate max-w-[130px] font-medium text-stone-600 dark:text-stone-300">
            {article.authorName}
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span>{formatTimeAgo(article.publishedAt || article.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{article.views}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

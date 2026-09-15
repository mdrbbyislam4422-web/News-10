import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Article, Category } from '../types';
import { NewsCard } from './NewsCard';

interface CategorySectionProps {
  category: Category;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onViewAll: (categorySlug: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  articles,
  onSelectArticle,
  onViewAll,
}) => {
  if (articles.length === 0) return null;

  const lead = articles[0];
  const rest = articles.slice(1, 4);

  return (
    <section id={`section-${category.slug}`} className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-6 rounded-xs"
            style={{ backgroundColor: category.color || '#dc2626' }}
          />
          <h2 className="font-serif text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white uppercase">
            {category.name}
          </h2>
        </div>

        <button
          onClick={() => onViewAll(category.slug)}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid: 1 Lead + 3 subcards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Category Lead */}
        <div className="md:col-span-6 lg:col-span-5 flex">
          <NewsCard
            article={lead}
            variant="standard"
            onClick={() => onSelectArticle(lead)}
          />
        </div>

        {/* Sub Articles */}
        <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between gap-3">
          {rest.map((art) => (
            <NewsCard
              key={art.id}
              article={art}
              variant="horizontal"
              onClick={() => onSelectArticle(art)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

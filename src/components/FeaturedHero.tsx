import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { Article } from '../types';
import { NewsCard } from './NewsCard';

interface FeaturedHeroProps {
  articles: Article[];
  topViewed: Article[];
  onSelectArticle: (article: Article) => void;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({
  articles,
  topViewed,
  onSelectArticle,
}) => {
  if (articles.length === 0) return null;

  const leadArticle = articles.find(a => a.featured) || articles[0];
  const secondaryArticles = articles.filter(a => a.id !== leadArticle.id).slice(0, 2);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead Hero (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col">
          <NewsCard
            article={leadArticle}
            variant="lead"
            onClick={() => onSelectArticle(leadArticle)}
            priority
          />
        </div>

        {/* Middle Column: 2 Secondary Stories (2.5 or 5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {secondaryArticles.map((art) => (
            <NewsCard
              key={art.id}
              article={art}
              variant="horizontal"
              onClick={() => onSelectArticle(art)}
            />
          ))}

          {/* Trending / Top Reads Box */}
          <div className="bg-stone-100/70 dark:bg-stone-900/60 p-4 rounded-sm border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-200 dark:border-stone-800">
              <Flame className="w-4 h-4 text-red-600" />
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-stone-900 dark:text-stone-100">
                Most Read Headlines
              </h3>
            </div>

            <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              {topViewed.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => onSelectArticle(item)}
                  className="py-2.5 flex items-start gap-3 cursor-pointer group"
                >
                  <span className="font-serif font-black text-lg text-red-600/80 w-5 shrink-0">
                    0{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-semibold text-xs sm:text-sm text-stone-800 dark:text-stone-200 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {item.views.toLocaleString()} readers
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

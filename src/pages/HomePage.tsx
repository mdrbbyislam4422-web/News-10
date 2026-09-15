import React from 'react';
import { Article, Category, BreakingNews } from '../types';
import { BreakingNewsTicker } from '../components/BreakingNewsTicker';
import { AdSlot } from '../components/AdSlot';
import { FeaturedHero } from '../components/FeaturedHero';
import { NewsCard } from '../components/NewsCard';
import { CategorySection } from '../components/CategorySection';
import { NewsletterBox } from '../components/NewsletterBox';
import { SEOHead } from '../components/SEOHead';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HomePageProps {
  articles: Article[];
  categories: Category[];
  breakingNews: BreakingNews[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  categories,
  breakingNews,
  onSelectArticle,
  onNavigate,
}) => {
  const published = articles.filter(a => a.status === 'published');
  const topViewed = [...published].sort((a, b) => b.views - a.views);
  const latestArticles = [...published].slice(0, 8);

  return (
    <div className="w-full">
      <SEOHead
        title="News 10 - Your Trusted Source for Breaking News"
        description="Comprehensive breaking news, politics, international diplomacy, technology, economy, and sports reports from Bangladesh and worldwide."
      />

      {/* 1. Breaking News Ticker */}
      <BreakingNewsTicker items={breakingNews} onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* 2. Top Advertisement Slot */}
        <AdSlot location="top" className="mb-6" />

        {/* 3. Featured Hero Section */}
        <FeaturedHero
          articles={published}
          topViewed={topViewed}
          onSelectArticle={onSelectArticle}
        />

        {/* 4. Responsive 728x90 Banner Advertisement */}
        <AdSlot location="banner" className="my-8" />

        {/* 5. Latest News Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between pb-2 mb-6 border-b-2 border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600" />
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight text-stone-900 dark:text-white">
                Latest News Wire
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/latest')}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer group"
            >
              <span>Explore All News</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestArticles.map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                variant="standard"
                onClick={() => onSelectArticle(art)}
              />
            ))}
          </div>
        </section>

        {/* 6. Dedicated Category Sections (Bangladesh, International, Politics, Sports, Tech, Business, Entertainment, Lifestyle) */}
        {categories.map((cat, index) => {
          const catArticles = published.filter(
            a => a.categorySlug.toLowerCase() === cat.slug.toLowerCase() ||
                 a.category.toLowerCase() === cat.name.toLowerCase()
          );

          if (catArticles.length === 0) return null;

          return (
            <React.Fragment key={cat.id}>
              <CategorySection
                category={cat}
                articles={catArticles}
                onSelectArticle={onSelectArticle}
                onViewAll={(slug) => onNavigate(`/category/${slug}`)}
              />

              {/* Interspersed ad slot after every 3 categories */}
              {index === 2 && (
                <AdSlot location="article" className="my-8" />
              )}
            </React.Fragment>
          );
        })}

        {/* 7. Morning Briefing Newsletter */}
        <NewsletterBox />

        {/* 8. Footer Leaderboard Ad */}
        <AdSlot location="footer" className="mt-8 mb-4" />
      </div>
    </div>
  );
};

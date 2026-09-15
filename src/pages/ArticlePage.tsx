import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { api } from '../api';
import { SEOHead } from '../components/SEOHead';
import { SocialShare } from '../components/SocialShare';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { AdSlot } from '../components/AdSlot';
import { NewsCard } from '../components/NewsCard';
import { 
  Clock, Eye, ChevronLeft, ChevronRight, User, Calendar, MessageSquare, 
  Send, Share2, Printer, ZoomIn, ZoomOut, CheckCircle2 
} from 'lucide-react';

interface ArticlePageProps {
  article: Article;
  allArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onNavigate: (path: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  article,
  allArticles,
  onSelectArticle,
  onNavigate,
}) => {
  const [currentViews, setCurrentViews] = useState(article.views);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0); // -1, 0, 1
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Scroll to top on load & record throttled view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Record view
    api.recordView(article.id).then((views) => {
      if (views > 0) setCurrentViews(views);
    });

    // Load comments
    api.getComments(article.id).then((data) => setComments(data));
  }, [article.id]);

  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil((article.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length / 200));

  // Find previous and next articles
  const publishedArticles = allArticles.filter(a => a.status === 'published');
  const currentIndex = publishedArticles.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? publishedArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < publishedArticles.length - 1 ? publishedArticles[currentIndex + 1] : null;

  // Related articles (same category or shared tags, excluding current)
  const relatedArticles = publishedArticles
    .filter(a => a.id !== article.id && (a.categorySlug === article.categorySlug || a.category === article.category))
    .slice(0, 4);

  // Fallback to latest if not enough category matches
  const displayRelated = relatedArticles.length > 0 
    ? relatedArticles 
    : publishedArticles.filter(a => a.id !== article.id).slice(0, 4);

  const handlePrint = () => {
    window.print();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const newComment = await api.addComment({
        articleId: article.id,
        authorName: commentName.trim() || 'Reader',
        authorEmail: commentEmail.trim() || 'reader@news10.com',
        content: commentText.trim()
      });
      setComments([newComment, ...comments]);
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch {
      // Failed to post comment
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-stone-950 transition-colors">
      <SEOHead
        title={article.seoTitle || `${article.title} | News 10`}
        description={article.seoDescription || article.excerpt}
        keywords={article.seoKeywords}
        article={article}
        type="article"
      />

      {/* 1. Breadcrumbs & Reading Controls Bar */}
      <div className="bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <nav className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <button onClick={() => onNavigate('/')} className="hover:text-red-600 cursor-pointer">
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigate(`/category/${article.categorySlug}`)}
              className="hover:text-red-600 font-semibold text-stone-800 dark:text-stone-200 cursor-pointer"
            >
              {article.category}
            </button>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline text-stone-400 truncate max-w-xs">
              {article.title}
            </span>
          </nav>

          <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
            {/* Font size zoom controls */}
            <div className="flex items-center gap-1 border border-stone-300 dark:border-stone-700 rounded-xs px-2 py-0.5">
              <button
                onClick={() => setFontSizeLevel(prev => Math.max(-1, prev - 1))}
                className="hover:text-red-600 cursor-pointer p-0.5"
                title="Decrease font size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold px-1 select-none">Text</span>
              <button
                onClick={() => setFontSizeLevel(prev => Math.min(1, prev + 1))}
                className="hover:text-red-600 cursor-pointer p-0.5"
                title="Increase font size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1 hover:text-red-600 cursor-pointer"
              title="Print Article"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Column (8 cols) */}
          <main className="lg:col-span-8 flex flex-col">
            {/* Category Tag & Live Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-xs">
                {article.category}
              </span>
              {article.breaking && (
                <span className="bg-stone-900 text-white font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Breaking News
                </span>
              )}
              <span className="text-xs text-stone-400 flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{readingTime} min read</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-stone-950 dark:text-stone-50 leading-tight tracking-tight mb-3">
              {article.title}
            </h1>

            {/* Subtitle / Excerpt */}
            {article.subtitle && (
              <p className="font-serif text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-4 italic">
                {article.subtitle}
              </p>
            )}

            {/* Byline and Published Timestamps */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-3 border-y border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 mb-6">
              <div className="flex items-center gap-3">
                {article.authorAvatar ? (
                  <img
                    src={article.authorAvatar}
                    alt={article.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-stone-400" />
                  </div>
                )}
                <div>
                  <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {article.authorName}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    {article.authorTitle || 'Staff Correspondent, News 10'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-red-600" />
                  <span>Published: {formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
                {article.updatedAt && article.updatedAt !== article.publishedAt && (
                  <div className="text-stone-400">
                    Updated: {formatDate(article.updatedAt)}
                  </div>
                )}
                <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  <span>{currentViews.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <SocialShare
              url={`/news/${article.categorySlug}/${article.slug}`}
              title={article.title}
              description={article.excerpt}
            />

            {/* Featured Image with Caption */}
            <figure className="my-5">
              <div className="overflow-hidden rounded-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-auto max-h-[520px] object-cover"
                />
              </div>
              {article.imageCaption && (
                <figcaption className="text-xs text-stone-500 dark:text-stone-400 mt-2 px-1 italic">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>

            {/* Top Article Ad */}
            <AdSlot location="top" className="my-4" />

            {/* Article Content Rendered */}
            <RichTextRenderer
              content={article.content}
              youtubeUrl={article.youtubeUrl}
              fontSizeLevel={fontSizeLevel}
            />

            {/* In-Article Advertisement Slot */}
            <AdSlot location="article" className="my-8" />

            {/* Article Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 my-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                <span className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">
                  Tagged:
                </span>
                {article.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onNavigate(`/search?q=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-1 text-xs bg-stone-100 dark:bg-stone-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* Social Sharing Bottom Bar */}
            <SocialShare
              url={`/news/${article.categorySlug}/${article.slug}`}
              title={article.title}
              description={article.excerpt}
            />

            {/* Previous & Next Article Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 p-4 bg-stone-50 dark:bg-stone-900/60 rounded-sm border border-stone-200 dark:border-stone-800">
              {prevArticle ? (
                <div
                  onClick={() => onSelectArticle(prevArticle)}
                  className="group cursor-pointer flex flex-col p-2 hover:bg-white dark:hover:bg-stone-800/60 rounded-xs transition-all"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous Story
                  </span>
                  <span className="font-serif font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 mt-1 group-hover:text-red-600">
                    {prevArticle.title}
                  </span>
                </div>
              ) : (
                <div />
              )}

              {nextArticle ? (
                <div
                  onClick={() => onSelectArticle(nextArticle)}
                  className="group cursor-pointer flex flex-col p-2 sm:text-right hover:bg-white dark:hover:bg-stone-800/60 rounded-xs transition-all"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1 sm:justify-end">
                    Next Story <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-serif font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 mt-1 group-hover:text-red-600">
                    {nextArticle.title}
                  </span>
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* Comments Section */}
            <section className="my-10 pt-6 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                  <span>Reader Discussion ({comments.length})</span>
                </h3>
              </div>

              {/* Submit Comment Form */}
              <form onSubmit={handleCommentSubmit} className="bg-stone-50 dark:bg-stone-900/60 p-5 rounded-sm border border-stone-200 dark:border-stone-800 mb-8">
                <h4 className="text-xs uppercase font-bold tracking-wider text-stone-700 dark:text-stone-300 mb-3">
                  Leave a Comment
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Your Full Name"
                    className="px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    placeholder="Your Email (will not be published)"
                    className="px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your perspective on this news item..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-red-500 mb-3"
                />

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{commentSubmitting ? 'Posting...' : 'Post Comment'}</span>
                  </button>

                  {commentSuccess && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Comment posted successfully!</span>
                    </span>
                  )}
                </div>
              </form>

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-xs text-stone-400 italic text-center py-6">
                  No comments yet. Be the first to share your perspective!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {c.authorName}
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Sidebar Column (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Sidebar AdSlot */}
            <AdSlot location="sidebar" />

            {/* Author Profile Card */}
            <div className="p-4 bg-stone-50 dark:bg-stone-900/80 rounded-sm border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3 mb-3">
                {article.authorAvatar && (
                  <img
                    src={article.authorAvatar}
                    alt={article.authorName}
                    className="w-12 h-12 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                  />
                )}
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {article.authorName}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {article.authorTitle || 'Senior Journalist'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Staff writer covering national policy, international diplomacy, and economic reform for News 10.
              </p>
            </div>

            {/* Related News Section */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-red-600">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-stone-900 dark:text-white">
                  Related Coverage
                </h3>
              </div>

              <div className="space-y-3">
                {displayRelated.map((art) => (
                  <NewsCard
                    key={art.id}
                    article={art}
                    variant="horizontal"
                    onClick={() => onSelectArticle(art)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

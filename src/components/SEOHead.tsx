import React, { useEffect, type FC } from 'react';
import { Article } from '../types';

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  article?: Article;
  type?: 'website' | 'article';
}

export const SEOHead: FC<SEOHeadProps> = ({
  title,
  description = 'Your Trusted Source for Breaking News - Live coverage from Bangladesh and around the world.',
  keywords = 'news 10, bangladesh news, breaking news, politics, international, business, sports, technology',
  canonicalUrl,
  article,
  type = 'website'
}) => {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes('News 10') ? title : `${title} | News 10`;
    document.title = formattedTitle;

    // Helper to update or create meta tags
    const setMeta = (nameOrProp: string, value: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', nameOrProp);
        else el.setAttribute('name', nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMeta('description', description);
    setMeta('keywords', keywords);

    // Open Graph
    setMeta('og:title', formattedTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    if (canonicalUrl) setMeta('og:url', canonicalUrl, true);
    if (article?.featuredImage) setMeta('og:image', article.featuredImage, true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', formattedTitle);
    setMeta('twitter:description', description);
    if (article?.featuredImage) setMeta('twitter:image', article.featuredImage);

    // Canonical link
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }

    // JSON-LD Structured Data for NewsArticle and Breadcrumb
    const existingScript = document.getElementById('json-ld-news-article');
    if (existingScript) existingScript.remove();

    if (article) {
      const script = document.createElement('script');
      script.id = 'json-ld-news-article';
      script.type = 'application/ld+json';

      const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'NewsArticle',
            'headline': article.title,
            'description': article.excerpt || article.subtitle,
            'image': [article.featuredImage],
            'datePublished': article.publishedAt,
            'dateModified': article.updatedAt || article.publishedAt,
            'author': {
              '@type': 'Person',
              'name': article.authorName,
            },
            'publisher': {
              '@type': 'NewsMediaOrganization',
              'name': 'News 10',
              'logo': {
                '@type': 'ImageObject',
                'url': `${window.location.origin}/logo.png`,
              }
            },
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': window.location.href,
            }
          },
          {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': window.location.origin,
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': article.category,
                'item': `${window.location.origin}/category/${article.categorySlug}`,
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': article.title,
                'item': window.location.href,
              }
            ]
          }
        ]
      };

      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, canonicalUrl, article, type]);

  return null;
};

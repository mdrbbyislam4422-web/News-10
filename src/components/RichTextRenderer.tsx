import React from 'react';

interface RichTextRendererProps {
  content: string;
  youtubeUrl?: string;
  fontSizeLevel?: number; // -1, 0, +1
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  youtubeUrl,
  fontSizeLevel = 0,
}) => {
  // Extract youtube video id if provided
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11
        ? `https://www.youtube-nocookie.com/embed/${match[2]}`
        : null;
    } catch {
      return null;
    }
  };

  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  const fontSizeClass =
    fontSizeLevel === -1
      ? 'text-base sm:text-base leading-relaxed'
      : fontSizeLevel === 1
      ? 'text-xl sm:text-2xl leading-loose'
      : 'text-lg sm:text-xl leading-relaxed';

  return (
    <div className={`newspaper-prose text-stone-800 dark:text-stone-200 font-serif ${fontSizeClass}`}>
      {/* Article HTML Content */}
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="space-y-4 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-bold [&>h2]:text-stone-900 [&>h2]:dark:text-stone-50 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:pt-4 [&>h2]:border-t [&>h2]:border-stone-200 [&>h2]:dark:border-stone-800
                   [&>h3]:font-serif [&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-bold [&>h3]:text-stone-900 [&>h3]:dark:text-stone-100 [&>h3]:mt-6 [&>h3]:mb-2
                   [&>p]:mb-4 [&>p]:leading-relaxed
                   [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-4 [&>ul]:space-y-2
                   [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-4 [&>ol]:space-y-2
                   [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:py-2 [&>blockquote]:my-6 [&>blockquote]:font-serif [&>blockquote]:italic [&>blockquote]:text-stone-700 [&>blockquote]:dark:text-stone-300 [&>blockquote]:bg-stone-50/80 [&>blockquote]:dark:bg-stone-900/50 [&>blockquote]:rounded-r-xs
                   [&>a]:text-red-600 [&>a]:dark:text-red-400 [&>a]:underline [&>a]:underline-offset-2
                   [&>img]:rounded-sm [&>img]:my-6 [&>img]:w-full [&>img]:shadow-xs"
      />

      {/* Embedded YouTube video if present */}
      {embedUrl && (
        <div className="my-8 overflow-hidden rounded-sm border border-stone-200 dark:border-stone-800 bg-black shadow-md">
          <div className="aspect-16/9 w-full">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>
          <div className="p-2 bg-stone-900 text-stone-400 text-xs text-center font-sans">
            Video report associated with this article.
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Facebook, Twitter, Send, Link2, Share2, Check, MessageCircle } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ url, title, description = '' }) => {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-2 py-3 border-y border-stone-200 dark:border-stone-800 my-5">
      <span className="text-xs uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mr-2">
        Share Article:
      </span>

      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-colors cursor-pointer"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Facebook</span>
      </a>

      {/* WhatsApp */}
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-colors cursor-pointer"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* X / Twitter */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold bg-stone-900/10 hover:bg-stone-900 text-stone-900 dark:text-stone-100 dark:hover:bg-white dark:hover:text-stone-900 hover:text-white transition-colors cursor-pointer"
        title="Share on X"
        aria-label="Share on X"
      >
        <Twitter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">X / Twitter</span>
      </a>

      {/* Telegram */}
      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white transition-colors cursor-pointer"
        title="Share on Telegram"
        aria-label="Share on Telegram"
      >
        <Send className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Telegram</span>
      </a>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
        title="Copy Link"
        aria-label="Copy Link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>

      {/* Android / Mobile Native Share (if supported) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer sm:hidden"
          title="Native Share"
          aria-label="Native Share"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      )}
    </div>
  );
};

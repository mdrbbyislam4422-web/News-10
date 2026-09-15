import { useState, useEffect } from 'react';
import { Radio, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { BreakingNews } from '../types';

interface BreakingNewsTickerProps {
  items: BreakingNews[];
  navigate?: (route: string) => void;
  onNavigate?: (route: string) => void;
}

export function BreakingNewsTicker({ items, navigate, onNavigate }: BreakingNewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNav = (route: string) => {
    if (onNavigate) onNavigate(route);
    else if (navigate) navigate(route);
    else if (typeof window !== 'undefined') window.location.href = route;
  };

  const activeItems = items.filter(i => i.active);

  useEffect(() => {
    if (activeItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeItems.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeItems.length, isPaused]);

  if (activeItems.length === 0) return null;

  const currentItem = activeItems[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeItems.length) % activeItems.length);
  };

  const handleClick = () => {
    if (currentItem.link) {
      handleNav(currentItem.link);
    }
  };

  return (
    <div 
      id="breaking-news-ticker"
      className="bg-red-700 text-white border-b border-red-800 relative z-20 shadow-xs"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between space-x-3">
          {/* Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
            </span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-sm font-sans flex items-center space-x-1">
              <Radio className="w-3.5 h-3.5 mr-1 animate-pulse" />
              <span>BREAKING NEWS</span>
            </span>
          </div>

          {/* Headline Content */}
          <div className="flex-1 overflow-hidden">
            <button
              onClick={handleClick}
              className="text-left w-full truncate text-xs sm:text-sm md:text-base font-semibold hover:underline transition-all block focus:outline-none"
              title={currentItem.title}
            >
              {currentItem.title}
            </button>
          </div>

          {/* Controls */}
          {activeItems.length > 1 && (
            <div className="flex items-center space-x-1 shrink-0">
              <span className="hidden md:inline text-[11px] font-mono text-red-200 mr-2">
                {currentIndex + 1}/{activeItems.length}
              </span>
              <button
                onClick={handlePrev}
                className="p-1 rounded hover:bg-red-800 transition-colors"
                aria-label="Previous breaking news"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded hover:bg-red-800 transition-colors"
                aria-label="Next breaking news"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

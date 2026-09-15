import { useEffect, useRef, useState } from 'react';
import { AdSlotConfig } from '../types';

interface AdSlotProps {
  location: 'top' | 'banner' | 'article' | 'sidebar' | 'footer';
  className?: string;
  config?: AdSlotConfig;
}

export function AdSlot({ location, className = '', config }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setHasError] = useState(false);
  const [, setIsLoaded] = useState(false);

  // If explicitly disabled in config
  if (config && !config.enabled) {
    return null;
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Clear previous ad content safely
    container.innerHTML = '';

    try {
      // 1. Banner slot: 468x60 iframe ad (highrevenueformat)
      if (location === 'banner') {
        const iframe = document.createElement('iframe');
        iframe.title = 'News 10 Banner Advertisement';
        iframe.style.width = '468px';
        iframe.style.height = '60px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.scrolling = 'no';
        iframe.loading = 'lazy';
        
        container.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <base target="_blank">
                <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }</style>
              </head>
              <body>
                <script type="text/javascript">
                  atOptions = {
                    'key' : 'ff3a4833441add20da62f7cb13987d35',
                    'format' : 'iframe',
                    'height' : 60,
                    'width' : 468,
                    'params' : {}
                  };
                </script>
                <script type="text/javascript" src="https://www.highrevenueformat.com/ff3a4833441add20da62f7cb13987d35/invoke.js"></script>
              </body>
            </html>
          `);
          iframeDoc.close();
          setIsLoaded(true);
        }
      } 
      // 2. Top Header & Footer Ad: profitableratecpmnetwork pl27655914
      else if (location === 'top' || location === 'footer') {
        const script = document.createElement('script');
        // Check if custom script src was passed in config
        const customSrcMatch = config?.scriptCode?.match(/src=["'](.*?)["']/);
        script.src = customSrcMatch ? customSrcMatch[1] : 'https://pl27655914.profitableratecpmnetwork.com/a7/bd/d2/a7bdd2ccea73a5f6365b353a44de03ab.js';
        script.async = true;
        script.onerror = () => setHasError(true);
        script.onload = () => setIsLoaded(true);
        container.appendChild(script);
      } 
      // 3. Sidebar & In-Article Ad: profitableratecpmnetwork pl27655486
      else {
        const script = document.createElement('script');
        // Check if custom script src was passed in config
        const customSrcMatch = config?.scriptCode?.match(/src=["'](.*?)["']/);
        script.src = customSrcMatch ? customSrcMatch[1] : 'https://pl27655486.profitableratecpmnetwork.com/d3/81/44/d381449bd8eab403acb783e78d782cc5.js';
        script.async = true;
        script.onerror = () => setHasError(true);
        script.onload = () => setIsLoaded(true);
        container.appendChild(script);
      }
    } catch (err) {
      console.warn(`Ad slot [${location}] failed to render cleanly:`, err);
      setHasError(true);
    }
  }, [location, config?.scriptCode]);

  // Different layout wrapper per location
  if (location === 'banner') {
    return (
      <div id={`ad-slot-${location}`} className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <div className="w-full max-w-[500px] mx-auto px-2">
          <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400 text-center mb-1">
            Advertisement
          </div>
          <div className="w-full flex justify-center items-center bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-sm p-1 overflow-hidden min-h-[66px]">
            {/* Responsive scaling container so 468px renders cleanly across all screen sizes */}
            <div className="max-w-full overflow-x-auto sm:overflow-visible flex justify-center items-center">
              <div ref={containerRef} className="w-[468px] h-[60px] origin-center scale-[0.68] xs:scale-[0.8] sm:scale-100 transition-transform flex justify-center items-center" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (location === 'top') {
    return (
      <div id={`ad-slot-${location}`} className={`w-full py-2 bg-stone-100/80 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400 text-center mb-1">
            Sponsored Partner
          </div>
          <div ref={containerRef} className="w-full min-h-[50px] flex justify-center items-center" />
        </div>
      </div>
    );
  }

  if (location === 'sidebar') {
    return (
      <div id={`ad-slot-${location}`} className={`w-full my-4 p-3 bg-stone-100 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-sm ${className}`}>
        <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400 text-center mb-2">
          Advertisement
        </div>
        <div ref={containerRef} className="w-full min-h-[250px] flex justify-center items-center overflow-hidden" />
      </div>
    );
  }

  return (
    <div id={`ad-slot-${location}`} className={`w-full my-6 p-3 bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-sm ${className}`}>
      <div className="text-[10px] uppercase font-semibold tracking-wider text-stone-500 dark:text-stone-400 text-center mb-1">
        Advertisement
      </div>
      <div ref={containerRef} className="w-full min-h-[60px] flex justify-center items-center overflow-hidden" />
    </div>
  );
}

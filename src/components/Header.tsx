import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Menu, X, ShieldAlert, ArrowRight, TrendingUp, Clock, Globe } from 'lucide-react';
import { Category } from '../types';

interface HeaderProps {
  categories: Category[];
  currentPath: string;
  onNavigate: (path: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  currentPath,
  onNavigate,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      setCurrentTime(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Latest', path: '/latest' },
    ...categories.slice(0, 8).map(c => ({
      label: c.name,
      path: `/category/${c.slug}`
    }))
  ];

  return (
    <header className="w-full bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-40 transition-colors shadow-xs">
      {/* 1. Top Utility Bar */}
      <div className="border-b border-stone-100 dark:border-stone-900 bg-stone-50/70 dark:bg-stone-900/60 text-xs text-stone-600 dark:text-stone-400 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>{currentTime}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-stone-500">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>Dhaka & Global Edition</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-stone-500 border-l border-stone-200 dark:border-stone-800 pl-3">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Market:</span>
              <span>USD/BDT 118.50</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">▲ +0.15%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Dark Mode Toggle */}
            <button
              id="header-dark-mode-toggle"
              onClick={onToggleDarkMode}
              className="p-1 rounded-sm text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Admin Portal Link */}
            <button
              id="header-admin-link"
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 cursor-pointer text-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Brand Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Mobile Hamburger Trigger */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex flex-col items-center sm:items-start cursor-pointer group select-none"
        >
          <div className="flex items-center gap-1">
            {/* Red Media Emblem */}
            <div className="bg-red-600 text-white font-black text-2xl sm:text-3xl px-2.5 py-0.5 tracking-tighter rounded-xs shadow-xs transition-transform group-hover:scale-[1.02]">
              NEWS
            </div>
            <div className="font-black text-2xl sm:text-3xl tracking-tighter text-stone-900 dark:text-white px-1">
              10
            </div>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 mb-2 animate-pulse" />
          </div>
          <p className="text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-stone-500 dark:text-stone-400 mt-0.5">
            Your Trusted Source for Breaking News
          </p>
        </div>

        {/* Desktop Search Bar & Trending */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 dark:bg-stone-900 py-1.5 px-3 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 text-red-600" />
            <span className="font-semibold text-stone-700 dark:text-stone-300">Trending:</span>
            <button 
              onClick={() => onNavigate('/news/bangladesh/dhaka-metro-rail-record-passenger-milestone')}
              className="hover:underline text-stone-600 dark:text-stone-300 max-w-[170px] truncate cursor-pointer"
            >
              Dhaka Metro Rail
            </button>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <button 
              onClick={() => onNavigate('/news/sports/bangladesh-historic-clean-sweep-cricket-victory')}
              className="hover:underline text-stone-600 dark:text-stone-300 cursor-pointer"
            >
              Tigers Victory
            </button>
          </div>

          {/* Quick Search Button */}
          <button
            id="desktop-search-button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 rounded-md transition-colors cursor-pointer border border-stone-200 dark:border-stone-800"
          >
            <Search className="w-3.5 h-3.5 text-stone-500" />
            <span>Search news...</span>
          </button>
        </div>

        {/* Mobile Search Button */}
        <button
          id="mobile-search-toggle"
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 rounded-md text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer"
          aria-label="Search news"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="bg-stone-100 dark:bg-stone-900 border-t border-b border-stone-200 dark:border-stone-800 py-3 px-4 transition-all">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-input-field"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines, politics, sports, international, business..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 text-stone-900 dark:text-stone-100"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 3. Primary Category Navigation (Desktop) */}
      <nav className="hidden lg:block border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <li key={item.path} className="shrink-0">
                  <button
                    onClick={() => onNavigate(item.path)}
                    className={`px-3.5 py-2 text-xs uppercase tracking-wider font-bold transition-all rounded-xs cursor-pointer ${
                      isActive
                        ? 'text-red-600 dark:text-red-500 border-b-2 border-red-600 dark:border-red-500'
                        : 'text-stone-700 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-stone-50 dark:hover:bg-stone-900'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[102px] z-50 bg-stone-950/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white dark:bg-stone-950 h-full overflow-y-auto border-r border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mb-5">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search News 10..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </form>

              {/* Category Links */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                News Sections
              </div>
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => {
                          onNavigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                            : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-stone-200 dark:border-stone-800 my-4 pt-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
                  Company & Information
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-stone-600 dark:text-stone-400">
                  <button onClick={() => { onNavigate('/about'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-red-600">About Us</button>
                  <button onClick={() => { onNavigate('/contact'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-red-600">Contact Us</button>
                  <button onClick={() => { onNavigate('/privacy'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-red-600">Privacy Policy</button>
                  <button onClick={() => { onNavigate('/terms'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-red-600">Terms of Service</button>
                  <button onClick={() => { onNavigate('/disclaimer'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-red-600">Disclaimer</button>
                </div>
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="border-t border-stone-200 dark:border-stone-800 pt-4 space-y-3">
              <button
                onClick={() => {
                  onToggleDarkMode();
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-stone-100 dark:bg-stone-900 rounded-md text-xs font-semibold text-stone-700 dark:text-stone-300"
              >
                <span>Appearance</span>
                <span className="flex items-center gap-1">
                  {darkMode ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{darkMode ? 'Dark' : 'Light'}</span>
                </span>
              </button>

              <button
                onClick={() => {
                  onNavigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Management Panel</span>
              </button>
            </div>
          </div>

          <div
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1"
          />
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { 
  Facebook, Twitter, Youtube, Instagram, Send, Shield, ChevronRight, Phone, Mail, MapPin 
} from 'lucide-react';
import { Category, SiteSettings } from '../types';

export interface FooterProps {
  categories: Category[];
  settings?: SiteSettings | null;
  navigate?: (route: string) => void;
  onNavigate?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ categories, settings, navigate, onNavigate }) => {
  const handleNav = (route: string) => {
    if (onNavigate) onNavigate(route);
    else if (navigate) navigate(route);
    else if (typeof window !== 'undefined') window.location.href = route;
  };

  const address = settings?.contactAddress || settings?.address || 'Kakrail VIP Road, Dhaka-1000, Bangladesh';
  const email = settings?.contactEmail || 'desk@news10.com';
  const phone = settings?.contactPhone || '+880 2 8391200';
  const tagline = settings?.tagline || 'Your Trusted Source for Breaking News';

  return (
    <footer className="w-full bg-stone-900 text-stone-300 dark:bg-stone-950 dark:text-stone-400 border-t-4 border-red-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => handleNav('/')}
              className="inline-flex flex-col items-start focus:outline-none group text-left cursor-pointer"
            >
              <div className="flex items-center tracking-tighter">
                <span className="font-extrabold text-3xl text-white uppercase tracking-tight font-serif">
                  NEWS
                </span>
                <span className="ml-1.5 px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-3xl rounded-sm">
                  10
                </span>
              </div>
              <span className="text-xs font-semibold tracking-widest text-stone-400 uppercase mt-1">
                {tagline}
              </span>
            </button>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              News 10 is an independent, 24/7 multimedia journalism organization providing round-the-clock verified reporting from Bangladesh and global bureaus.
            </p>

            <div className="text-xs text-stone-400 space-y-1.5 pt-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <span>{email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>{phone}</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={settings?.socialLinks?.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-[#1877F2] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.twitter || 'https://twitter.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.youtube || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-[#FF0000] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.telegram || 'https://t.me'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-[#229ED9] text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick News Sections */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-stone-800 pb-2 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleNav(`/category/${cat.slug}`)}
                    className="hover:text-red-500 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-stone-600" />
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-stone-800 pb-2 mb-3">
              Special Coverage
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleNav(`/category/${cat.slug}`)}
                    className="hover:text-red-500 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronRight className="w-3 h-3 text-stone-600" />
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav('/latest')}
                  className="hover:text-red-500 transition-colors flex items-center space-x-1 font-semibold text-red-400 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-stone-600" />
                  <span>Latest News Feed</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Corporate & Legal */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-stone-800 pb-2 mb-3">
              Information
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('/about')} className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/disclaimer')} className="hover:text-white transition-colors cursor-pointer">
                  Disclaimer
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => handleNav('/admin')}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Newsroom</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            {settings?.copyrightText || '© 2026 News 10. All Rights Reserved.'}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => handleNav('/privacy')} className="hover:text-stone-300 cursor-pointer">Privacy</button>
            <span>•</span>
            <button onClick={() => handleNav('/terms')} className="hover:text-stone-300 cursor-pointer">Terms</button>
            <span>•</span>
            <button onClick={() => handleNav('/disclaimer')} className="hover:text-stone-300 cursor-pointer">Disclaimer</button>
            <span>•</span>
            <a href="/sitemap.xml" target="_blank" className="hover:text-stone-300">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

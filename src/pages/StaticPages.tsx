import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Newspaper, Award } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface StaticPageProps {
  type: 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer';
  onNavigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  if (type === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <SEOHead title="About Us - News 10" description="Learn about News 10's editorial principles, mission, and journalism standards." />
        <div className="pb-4 mb-6 border-b-2 border-red-600">
          <span className="text-xs uppercase font-bold text-red-600 tracking-wider">Editorial Overview</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-stone-900 dark:text-white mt-1">
            About News 10
          </h1>
        </div>

        <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 font-serif leading-relaxed space-y-5 text-base sm:text-lg">
          <p className="font-sans text-lg font-semibold text-stone-900 dark:text-stone-100 leading-normal">
            News 10 is an independent, non-partisan 24/7 digital news publisher headquartered in Dhaka, Bangladesh, dedicated to providing accurate, verified, and timely news reports spanning domestic affairs, international diplomacy, business, technology, and culture.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 not-prose font-sans">
            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800">
              <Newspaper className="w-6 h-6 text-red-600 mb-2" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Independent Journalism</h3>
              <p className="text-xs text-stone-500 mt-1">Free from commercial bias and political patronage.</p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800">
              <ShieldCheck className="w-6 h-6 text-red-600 mb-2" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Fact-Checked Truth</h3>
              <p className="text-xs text-stone-500 mt-1">Multi-source verification before any headline breaks.</p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-sm border border-stone-200 dark:border-stone-800">
              <Award className="w-6 h-6 text-red-600 mb-2" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Reader Accountability</h3>
              <p className="text-xs text-stone-500 mt-1">Transparent correction protocols and ethical guidelines.</p>
            </div>
          </div>

          <h2 className="font-sans font-bold text-xl text-stone-900 dark:text-stone-100 pt-4">Our Newsroom Principles</h2>
          <p>
            Every dispatch published by News 10 adheres to the strictest benchmarks of investigative reporting and professional balance. We believe in providing readers with facts unburdened by sensationalism.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <SEOHead title="Contact Us - News 10" description="Contact the News 10 editorial desk, investigative reporters, or advertising department." />
        <div className="pb-4 mb-6 border-b-2 border-red-600">
          <span className="text-xs uppercase font-bold text-red-600 tracking-wider">Newsroom & Support</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-stone-900 dark:text-white mt-1">
            Contact News 10
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-6">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Have a breaking tip, correction request, or advertising inquiry? Reach our central bureau directly.
            </p>

            <div className="space-y-4 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">Central Newsroom</strong>
                  <span>42 Kawran Bazar Commercial Area, Dhaka 1215, Bangladesh</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">Email Desks</strong>
                  <span>News tips: tips@news10.com</span><br/>
                  <span>Editorial: editor@news10.com</span><br/>
                  <span>Advertising: ads@news10.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-stone-900 dark:text-stone-100">Telephone Hotlines</strong>
                  <span>Newsroom: +880 1700-101010</span><br/>
                  <span>Toll-Free: +880 2-9876543</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-stone-50 dark:bg-stone-900 p-6 rounded-sm border border-stone-200 dark:border-stone-800">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
              Send a Secure Message to the Editors
            </h3>

            {submitted ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-sm text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Thank you. Your message has been routed to the senior news desk.</span>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Department / Subject</label>
                  <input
                    type="text"
                    required
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="e.g. Breaking News Tip / Opinion Submission"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Privacy, Terms, Disclaimer
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    disclaimer: 'Legal Disclaimer'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <SEOHead title={`${titles[type]} - News 10`} description="News 10 legal information and terms of use." />
      <div className="pb-4 mb-6 border-b-2 border-red-600">
        <span className="text-xs uppercase font-bold text-red-600 tracking-wider">Compliance & Legal</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-stone-900 dark:text-white mt-1">
          {titles[type]}
        </h1>
        <p className="text-xs text-stone-400 mt-1">Effective Date: January 1, 2026 • News 10 Media Network</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 font-serif leading-relaxed space-y-4 text-sm sm:text-base">
        {type === 'privacy' && (
          <>
            <p>News 10 operates with rigorous commitment to individual privacy and transparency regarding user telemetry.</p>
            <h3>1. Information We Collect</h3>
            <p>We do not require personal identification for standard reading. When you subscribe to our newsletter or comment on articles, we collect email addresses solely for transactional notifications and editorial verification.</p>
            <h3>2. Third-Party Advertisements</h3>
            <p>We serve compliant display advertisements to sustain our free newsroom operations. Third-party ad vendors may use anonymized cookies to deliver contextually relevant advertisements.</p>
          </>
        )}

        {type === 'terms' && (
          <>
            <p>By accessing or interacting with News 10 services, you agree to comply with our standards of fair usage and intellectual property policies.</p>
            <h3>1. Intellectual Property</h3>
            <p>All written dispatches, photographs, editorial analyses, and layout elements published under News 10 are protected under international copyright regulations. Unauthorized commercial reproduction is strictly prohibited.</p>
            <h3>2. Community Commentary</h3>
            <p>Comment sections must remain civil, lawful, and free of hate speech, defamation, or unsolicited commercial solicitations.</p>
          </>
        )}

        {type === 'disclaimer' && (
          <>
            <p>News 10 publishes news, market indices, and analytical commentary in good faith for general informational purposes.</p>
            <h3>1. Financial & Medical Disclaimer</h3>
            <p>Financial quotes, currency rates, and market indicators do not constitute financial advisory services. Readers should consult accredited financial advisors before executing investment decisions.</p>
            <h3>2. Third-Party Links</h3>
            <p>Articles may link to external websites. News 10 does not control and is not liable for third-party content.</p>
          </>
        )}
      </div>
    </div>
  );
};

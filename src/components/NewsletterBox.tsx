import React, { useState, type FormEvent } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api';

export function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await api.subscribe(email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(res.message || 'Subscription failed');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <section className="my-12 bg-gradient-to-r from-stone-900 to-stone-950 text-white rounded-sm p-6 sm:p-10 border-l-4 border-red-600 shadow-sm">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-red-500 text-xs font-bold uppercase tracking-widest mb-1">
            <Mail className="w-4 h-4" />
            <span>DAILY MORNING BRIEFING</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white leading-tight">
            Get News 10 Highlights Delivered to Your Inbox
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-xl">
            Join over 85,000 readers who start their day with our curated summary of national politics, international affairs, business markets, and investigative dispatches.
          </p>
        </div>

        <div className="w-full md:w-auto shrink-0">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="px-4 py-3 bg-stone-800/90 border border-stone-700 rounded text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 font-bold text-xs uppercase tracking-wider rounded transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {status === 'success' && (
            <div className="flex items-center space-x-1.5 text-xs text-green-400 mt-2 justify-center md:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center space-x-1.5 text-xs text-red-400 mt-2 justify-center md:justify-start">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

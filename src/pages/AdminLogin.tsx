import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { api } from '../api';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('admin@news10.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.resetPassword(resetEmail, resetNewPass);
      setResetMsg(res.message);
      setTimeout(() => {
        setShowResetModal(false);
        setResetMsg(null);
      }, 2000);
    } catch (err: any) {
      setResetMsg(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-stone-100 dark:bg-stone-950 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm shadow-xl p-6 sm:p-8">
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1 cursor-pointer select-none mb-3" onClick={onNavigateHome}>
            <div className="bg-red-600 text-white font-black text-2xl px-2.5 py-0.5 tracking-tighter rounded-xs">
              NEWS
            </div>
            <div className="font-black text-2xl tracking-tighter text-stone-900 dark:text-white px-1">
              10
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase font-bold text-red-600 tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Editorial & CMS Portal</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Sign in with authorized administrator credentials.
          </p>
        </div>

        {/* Demo Credentials Alert Banner */}
        <div className="p-3 mb-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xs text-xs text-amber-800 dark:text-amber-300">
          <div className="font-bold flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Pre-Configured Admin Credentials:</span>
          </div>
          <div className="mt-1 font-mono text-[11px] space-y-0.5">
            <div>Email: <span className="font-bold">admin@news10.com</span></div>
            <div>Password: <span className="font-bold">admin123</span></div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xs text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-[11px] text-red-600 hover:underline cursor-pointer"
              >
                Reset Password
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-red-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-button"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Newsroom CMS'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 text-center">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Portal</span>
          </button>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-sm max-w-sm w-full border border-stone-200 dark:border-stone-800 shadow-xl">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white mb-2">
              Set New Password
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter your email and the new password for administrator access.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                required
                placeholder="admin@news10.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
              />
              <input
                type="password"
                required
                placeholder="New Password (min 6 chars)"
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xs"
              />

              {resetMsg && (
                <p className="text-xs text-red-600 font-medium">{resetMsg}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white font-bold text-xs uppercase rounded-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

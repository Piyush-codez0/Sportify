"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040812] flex items-center justify-center px-4 relative transition-colors overflow-hidden">
      <style>{`
        .login-glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
        }
        :is(.dark) .login-glass-card {
          background: rgba(10, 20, 45, 0.82);
          border: 1px solid rgba(0, 245, 160, 0.18);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .login-glass-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: transparent;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          pointer-events: none;
          z-index: 10;
        }
        :is(.dark) .login-glass-card::before {
          background: linear-gradient(90deg, transparent, rgba(0,245,160,0.5), rgba(0,217,245,0.5), transparent);
        }
        .login-neon-input { transition: all 0.2s ease-out !important; }
        .login-neon-input:focus {
          border-color: rgba(99, 102, 241, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
          outline: none !important;
        }
        :is(.dark) .login-neon-input:focus {
          border-color: rgba(0, 245, 160, 0.45) !important;
          box-shadow: 0 0 0 3px rgba(0,245,160,0.1), 0 0 20px rgba(0,245,160,0.08) !important;
        }
        .login-neon-button {
          background: linear-gradient(135deg, #00f5a0, #00d9f5) !important;
          /* More visible but still controlled glow: teal base + soft cyan rim + small dark anchor */
          box-shadow: 0 8px 20px rgba(0,245,160,0.22), 0 0 10px rgba(0,217,245,0.14), 0 2px 6px rgba(0,0,0,0.12) !important;
          transition: all 0.16s ease-out !important;
          color: #0a142d !important;
          border: none !important;
        }
        .login-neon-button:hover {
          transform: translateY(-2px) scale(1.01) !important;
          /* Slightly stronger but still tight hover glow */
          box-shadow: 0 12px 28px rgba(0,245,160,0.28), 0 0 16px rgba(0,217,245,0.18), 0 4px 10px rgba(0,0,0,0.14) !important;
        }
        .login-orb {
          position: absolute;
          border-radius: 50%;
          animation: loginDrift 12s infinite alternate ease-in-out;
          /* visible in light mode at low opacity so the effect isn't lost */
          opacity: 1;
          pointer-events: none;
          background-repeat: no-repeat;
          will-change: transform, opacity, filter;
          transform: translateZ(0);
          mix-blend-mode: screen;
        }
        /* stronger visibility in dark mode */
        :is(.dark) .login-orb {
          opacity: 1;
        }

        /* Use radial-gradient stops to produce a smooth, banding-free glow */
        .login-orb1 {
          width: 520px;
          height: 520px;
          top: -10%;
          left: -10%;
          background: radial-gradient(circle at 30% 30%, rgba(0,245,160,0.42) 0%, rgba(0,217,245,0.18) 30%, rgba(0,0,0,0) 70%);
          filter: blur(120px);
        }
        .login-orb2 {
          width: 400px;
          height: 400px;
          bottom: -10%;
          right: -10%;
          background: radial-gradient(circle at 70% 70%, rgba(0,217,245,0.36) 0%, rgba(0,245,160,0.12) 35%, rgba(0,0,0,0) 75%);
          filter: blur(110px);
          animation-delay: -5s;
        }
        .login-orb3 {
          width: 280px;
          height: 280px;
          top: 40%;
          right: -5%;
          background: radial-gradient(circle at 60% 40%, rgba(123,97,255,0.32) 0%, rgba(0,217,245,0.08) 40%, rgba(0,0,0,0) 80%);
          filter: blur(100px);
          animation-delay: -9s;
        }
        @keyframes loginDrift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(40px, 30px) scale(1.08); }
        }
      `}</style>

      {/* Floating orbs - visible in dark mode only */}
      <div className="login-orb login-orb1"></div>
      <div className="login-orb login-orb2"></div>
      <div className="login-orb login-orb3"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="login-glass-card p-6 sm:p-8 transition-colors relative overflow-hidden">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex flex-col items-center gap-2">
              <img src="/icon.png" alt="Sportify" className="w-16 h-16" />
            </Link>
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white transition-colors">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm transition-colors">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors text-sm">
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-white/5"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/90 dark:bg-transparent text-gray-500 dark:text-gray-400 transition-colors text-xs">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-neon-input w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-neon-input w-full px-4 py-2.5 pr-11 border border-gray-200 dark:border-white/10 rounded-xl bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-indigo-600 dark:text-cyan-400 hover:text-indigo-800 dark:hover:text-cyan-300 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-neon-button w-full py-2.5 px-4 rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-gray-600 dark:text-gray-400 text-sm transition-colors">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-indigo-600 dark:text-cyan-400 hover:text-indigo-800 dark:hover:text-cyan-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

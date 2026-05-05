"use client";

import { useState } from "react";
import Link from "next/link";

import { BorderBeam } from "@/components/ui/border-beam";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040812] flex items-center justify-center px-4 relative transition-colors">

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-indigo-200/50 dark:border-indigo-700/50 transition-colors relative overflow-hidden">
          <BorderBeam
            size={120}
            duration={12}
            colorFrom="#22d3ee"
            colorTo="#a78bfa"
            borderWidth={3}
            initialOffset={0}
          />
          <BorderBeam
            size={120}
            duration={12}
            colorFrom="#f472b6"
            colorTo="#f59e0b"
            borderWidth={3}
            initialOffset={50}
            reverse
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none rounded-2xl" />

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-3">
              <img
                src="/icon.png"
                alt="Sportify"
                className="w-16 h-16"
              />
              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
                Sportify
              </span>
            </Link>
            <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              Forgot Password?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors">
              {submitted
                ? "Check your email for a reset link"
                : "No worries, we'll send you reset instructions"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-4xl mb-3">📧</div>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Reset link sent!
                </p>
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  If an account exists for <strong>{email}</strong>, you'll
                  receive an email with instructions to reset your password.
                </p>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold text-sm transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors"
                >
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-400 dark:disabled:bg-indigo-700 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-gray-600 dark:text-gray-300 transition-colors">
            <Link
              href="/auth/login"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors inline-flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

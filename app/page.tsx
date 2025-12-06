"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "organizer") {
        router.push("/organizer/dashboard");
      } else if (user.role === "player") {
        router.push("/player/dashboard");
      } else if (user.role === "sponsor") {
        router.push("/sponsor/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-slate-950">
        <div className="text-xl font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-slate-950 relative overflow-hidden transition-colors">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-300/10 via-transparent to-transparent dark:from-purple-600/5" />
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-300/10 via-transparent to-transparent dark:from-blue-600/5" />

      <SportsDoodlesBackground />

      {/* Modern Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm relative z-20 border-b border-purple-200/20 dark:border-purple-800/20 transition-colors sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/icon2.png"
                  alt="Sportify"
                  className="w-20 h-19 h-10 rounded-xl shadow-lg"
                />
                {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Sportify
                </h1> */}
              </Link>
            </div>
            <div className="flex gap-3 items-center">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-all"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        {/* Super soft hero gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-blue-50/15 to-white/10 dark:from-purple-900/5 dark:via-blue-900/5 dark:to-transparent -z-10 rounded-3xl blur-xl" />

        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100/50 dark:bg-purple-900/30 border border-purple-300/50 dark:border-purple-700/50 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              India's Premier Sports Tournament Platform
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
              Transform Local
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Sports Tournaments
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Organize, discover, and participate in local sports tournaments
            across India.
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              {" "}
              Connect organizers, players, and sponsors
            </span>{" "}
            in one unified platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/auth/register"
              className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/tournaments"
              className="px-10 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-gray-100 border-2 border-purple-300 dark:border-purple-700 rounded-2xl text-lg font-bold hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-500 hover:scale-105 transition-all duration-300"
            >
              Explore Tournaments
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-purple-200/30 dark:border-purple-800/30">
            <div>
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                500+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Tournaments
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                10K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Active Players
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                50+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Cities
              </div>
            </div>
          </div>
        </div>

        {/* Role Cards - Glassmorphism */}
        <div className="mt-32 grid md:grid-cols-3 gap-6">
          {/* Organizers Card */}
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-purple-50/60 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-purple-900/30 backdrop-blur-xl border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400/70 dark:hover:border-purple-500/70 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-3xl transition-all duration-500" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                For Organizers
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Create and manage tournaments with ease. Track registrations,
                verify players, and handle payments seamlessly.
              </p>
            </div>
          </div>

          {/* Players Card */}
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-blue-50/60 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-blue-900/30 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400/70 dark:hover:border-blue-500/70 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-3xl transition-all duration-500" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                For Players
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Discover nearby tournaments, register digitally, and build your
                competitive profile. Never miss an opportunity to play.
              </p>
            </div>
          </div>

          {/* Sponsors Card */}
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-pink-50/60 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-pink-900/30 backdrop-blur-xl border border-pink-200/50 dark:border-pink-700/50 hover:border-pink-400/70 dark:hover:border-pink-500/70 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/5 rounded-3xl transition-all duration-500" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                For Sponsors
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Find relevant tournaments and promote your brand directly within
                the sporting community. Maximize your reach and impact.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features - 2x2 Grid with Sport Icons */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to revolutionize sports tournaments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300">
              <div className="flex gap-5 items-start">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Location-Based Discovery
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Find tournaments near you based on city and state with smart
                    geolocation
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300">
              <div className="flex gap-5 items-start">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Digital Registration
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Individual and team registration with secure Aadhar
                    verification
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300">
              <div className="flex gap-5 items-start">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Secure Payments
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Razorpay integration for hassle-free and secure tournament
                    fees
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300">
              <div className="flex gap-5 items-start">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Real-time Notifications
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Stay updated with tournament changes and instant
                    announcements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-b from-purple-100/80 to-slate-100/90 dark:from-gray-900/95 dark:to-gray-950/90 backdrop-blur-xl border-t border-purple-200/30 dark:border-purple-800/30 mt-32 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/icon.png"
                  alt="Sportify"
                  className="w-10 h-10 rounded-xl shadow-lg"
                />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Sportify
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                India's premier platform for organizing, discovering, and
                participating in local sports tournaments. Join thousands of
                players and organizers today.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/tournaments"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Browse Tournaments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Users */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                For Users
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/auth/register?role=organizer"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    For Organizers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register?role=player"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    For Players
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register?role=sponsor"
                    className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    For Sponsors
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-purple-200/30 dark:border-purple-800/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 Sportify. Revolutionizing local sports in India.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

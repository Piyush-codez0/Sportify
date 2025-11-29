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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 relative transition-colors">
      <SportsDoodlesBackground />

      <nav className="bg-white dark:bg-gray-800 shadow-sm relative z-10 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Sportify
              </h1>
            </div>
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 transition-colors">
            Transform Local Sports Tournaments
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors">
            Organize, discover, and participate in local sports tournaments
            across India. Connect organizers, players, and sponsors in one
            unified platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/tournaments"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-500 rounded-lg text-lg font-semibold hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
            >
              Browse Tournaments
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-colors border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">
              For Organizers
            </h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors">
              Create and manage tournaments with ease. Track registrations,
              verify players, and handle payments seamlessly.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-colors border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl">⚽</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">
              For Players
            </h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors">
              Discover nearby tournaments, register digitally, and build your
              competitive profile. Never miss an opportunity to play.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-colors border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 transition-colors">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">
              For Sponsors
            </h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors">
              Find relevant tournaments and promote your brand directly within
              the sporting community. Maximize your reach and impact.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white transition-colors">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white transition-colors">
                  Location-Based Discovery
                </h4>
                <p className="text-gray-600 dark:text-gray-300 transition-colors">
                  Find tournaments near you based on city and state
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white transition-colors">
                  Digital Registration
                </h4>
                <p className="text-gray-600 dark:text-gray-300 transition-colors">
                  Individual and team registration with Aadhar verification
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white transition-colors">
                  Secure Payments
                </h4>
                <p className="text-gray-600 dark:text-gray-300 transition-colors">
                  Razorpay integration for hassle-free tournament fees
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-white transition-colors">
                  Real-time Notifications
                </h4>
                <p className="text-gray-600 dark:text-gray-300 transition-colors">
                  Stay updated with tournament changes and announcements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-300 transition-colors">
            © 2025 Sportify. Revolutionizing local sports in India.
          </p>
        </div>
      </footer>
    </div>
  );
}

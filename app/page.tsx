"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { Pointer } from "@/components/ui/pointer";
import SmoothScroll from "@/components/SmoothScroll";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

// FAQ Item Component
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-8 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {question}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed pt-4 border-t border-purple-100 dark:border-purple-800/30 mt-4">
                {answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

function HoverGif({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    if (canvasRef.current && imgRef.current) {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    }
  };

  return (
    <div className={className} style={{ position: "relative" }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain filter drop-shadow-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        onLoad={handleLoad}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain filter drop-shadow-sm transition-opacity duration-300 opacity-100 group-hover:opacity-0 pointer-events-none"
      />
    </div>
  );
}

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end 60%"],
  });
  const dotPosition = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    setMounted(true);

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide if scrolling down and past the first view window
      if (
        currentScrollY > window.innerHeight * 0.5 &&
        currentScrollY > lastScrollY
      ) {
        setIsNavHidden(true);
      } else {
        setIsNavHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keep the landing page accessible to logged-in users.
  // Previously we auto-redirected to role dashboards here; removed so users can visit the landing page while signed in.

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-slate-50 dark:bg-[#040812] relative overflow-hidden transition-colors">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-200/40 via-transparent to-transparent dark:from-slate-800/20" />
        <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-200/40 via-transparent to-transparent dark:from-slate-800/20" />

        {/* Subtle Noise Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay">
          <svg className="w-full h-full">
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        {/* Mobile Menu Backdrop Blur Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu-overlay-global"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden fixed inset-0 top-[56px] bg-white/30 dark:bg-black/40 backdrop-blur-lg z-30"
            />
          )}
        </AnimatePresence>

        {/* Modern Navigation */}
        <nav
          className={`bg-white/70 dark:bg-[#040812]/60 backdrop-blur-[10px] dark:backdrop-blur-2xl shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] fixed inset-x-0 top-0 z-40 border-b border-black/5 dark:border-white/10 transition-all duration-300 ${
            isNavHidden ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-20 items-center">
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <img
                    src="/icon.png"
                    alt="Sportify"
                    className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl"
                  />
                </Link>
              </div>
              <div className="flex gap-2 sm:gap-3 items-center">
                {mounted && <ThemeToggle />}

                {/* Desktop Links */}
                <div className="hidden sm:flex gap-3 items-center">
                  {user ? (
                    <>
                      <Link
                        href={
                          user.role === "organizer"
                            ? "/organizer/dashboard"
                            : user.role === "player"
                              ? "/player/dashboard"
                              : "/sponsor/dashboard"
                        }
                        className="px-5 py-2.5 text-base text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 font-medium transition-all"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            await logout();
                            router.push("/");
                          } catch (e) {
                            router.push("/");
                          }
                        }}
                        className="px-4 py-2 text-base bg-white/10 dark:bg-white/5 text-gray-800 dark:text-white rounded-xl font-medium hover:opacity-90 transition-all"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="px-5 py-2.5 text-base text-gray-700 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-300 font-medium transition-all"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        className="px-6 py-2.5 text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>

                {/* Mobile Hamburger Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-menu-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="sm:hidden overflow-hidden border-t border-purple-200/50 dark:border-purple-500/20 bg-gradient-to-b from-white/90 to-white/80 dark:from-gray-900/80 dark:to-black/80 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(168,85,247,0.15)] relative z-40"
              >
                <div className="px-4 py-6 flex flex-col gap-4 relative">
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                  <Link
                    href="/tournaments"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 relative z-10 px-2"
                  >
                    Explore Tournaments
                  </Link>
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800/50 to-transparent my-2 relative z-10" />
                  {user ? (
                    <>
                      <Link
                        href={
                          user.role === "organizer"
                            ? "/organizer/dashboard"
                            : user.role === "player"
                              ? "/player/dashboard"
                              : "/sponsor/dashboard"
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          try {
                            await logout();
                            router.push("/");
                          } catch (e) {
                            router.push("/");
                          }
                        }}
                        className="text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center py-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10">
          {/* Hero Background Image with Blur & Dark Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Mobile Hero Image (High Impact for small screens) */}
            <img
              src="/icons/hero-image-mobile.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-105 blur-[1px] block sm:hidden"
            />
            {/* Desktop Light Mode Image */}
            <img
              src="/icons/hero-image-light.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px] hidden sm:block dark:sm:hidden"
            />
            {/* Desktop Dark Mode Image */}
            <img
              src="/icons/hero-image.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px] hidden sm:dark:block"
            />
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-white/10 dark:bg-none dark:bg-black/30" />
            {/* Gradient fade to page background at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-[#040812] dark:via-[#040812]/80 dark:to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8 sm:pb-24 relative z-10">
            {/* Main Content Wrapper */}
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-full mb-4 sm:mb-5 backdrop-blur-sm shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  India's Premier Sports Tournament Platform
                </span>
              </div>

              {/* Main Headline */}
              <div className="mb-6 sm:mb-8 relative">
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight relative w-full text-center tracking-tight text-gray-900 dark:text-white">
                  Build Tomorrow's <br className="sm:hidden" />
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                      Champions
                    </span>
                    {/* Subtle underline/highlight effect behind the text */}
                    <span className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500/40 to-pink-500/40 -z-10 -rotate-1 rounded-sm blur-[0.5px]"></span>
                  </span>
                </h1>
              </div>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-200 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-medium px-2">
                Organize, discover, and participate in local sports tournaments
                across India.
                <span className="text-purple-600 dark:text-purple-300 font-semibold">
                  {" "}
                  Connect organizers, players, and sponsors
                </span>{" "}
                in one unified platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-4 mb-6 sm:mb-8 px-2 pt-16   ">
                <Link
                  href="/auth/register"
                  className="group relative px-6 sm:px-10 py-4 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-lg sm:text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 animate-pulse-ring"
                >
                  {/* Button content */}
                  <span className="relative z-10 flex items-center gap-2">
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
                  </span>
                </Link>
                <Link
                  href="/tournaments"
                  className="px-6 sm:px-10 py-4 sm:py-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm text-slate-800 dark:text-white border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-lg sm:text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:scale-105 transition-all duration-300"
                >
                  Explore Tournaments
                </Link>
              </div>

              {/* Real Product Signals */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2 mb-8 sm:mb-12">
                {/* Trending (Orange) */}
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50/80 dark:bg-orange-500/10 backdrop-blur-md rounded-full border border-orange-200 dark:border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:scale-105 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300">
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    🔥 20+ tournaments this month
                  </span>
                </div>

                {/* Active (Green) */}
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/80 dark:bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Active in 20+ cities
                  </span>
                </div>

                {/* Info (Blue) */}
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/80 dark:bg-blue-500/10 backdrop-blur-md rounded-full border border-blue-200 dark:border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    👥 1000+ players joined
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kinetic Light Pipe Separator */}
          <div className="w-full max-w-5xl mx-auto py-12 sm:pb-24 pt-4 relative flex items-center justify-center z-20">
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-slate-400/30 dark:via-slate-500/30 to-transparent" />
            <div className="absolute w-2/3 h-[2px] bg-gradient-to-r from-transparent via-slate-500/30 dark:via-slate-400/30 to-transparent blur-[1px]" />
            <div className="absolute w-1/3 h-[8px] bg-gradient-to-r from-transparent via-slate-400/20 dark:via-slate-300/20 to-transparent blur-md animate-pulse" />
            <div className="relative w-8 h-8 bg-white/40 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-300/40 dark:border-slate-600/40 rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-slate-300/20 dark:from-slate-700/20 dark:to-slate-600/20" />
              {/* Sports Accent Pulse */}
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Rest of the Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-24 relative z-10">
          {/* How It Works Section */}
          <div className="max-w-5xl mx-auto py-8 sm:py-12 relative z-10">
            <div className="text-center mb-10 sm:mb-14">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                className="font-display text-2xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent tracking-tight"
              >
                How It Works
              </motion.h2>
            </div>

            <div ref={timelineRef} className="relative max-w-4xl mx-auto pb-6">
              {/* Vertical Light Pipe Timeline */}
              <div
                className="absolute left-8 sm:left-1/2 top-0 w-[2px] sm:-ml-[1px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full"
                style={{ height: "83%" }}
              >
                {/* The filled part of the pipe */}
                <motion.div
                  className="absolute top-0 w-full bg-gradient-to-b from-purple-500/50 to-pink-500 shadow-[0_0_10px_#ec4899] rounded-full"
                  style={{ height: dotPosition }}
                />
                {/* The moving dot */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-background border-2 border-pink-500 shadow-[0_0_20px_#ec4899] flex items-center justify-center z-20"
                  style={{ top: dotPosition, y: "-50%" }}
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500 animate-pulse" />
                </motion.div>
              </div>

              {/* Steps */}
              <div className="space-y-5 sm:space-y-12 relative">
                {[
                  {
                    step: "01",
                    title: "Create Your Profile",
                    desc: "Begin your journey by establishing your digital identity. Create a specialized profile as a Player, Organizer, or Sponsor.",
                    icon: (
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ),
                    visual: (
                      <div className="mt-6 relative h-48 sm:h-56 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 shadow-sm bg-white dark:bg-gray-800">
                        <img
                          src="/icons/User.png"
                          alt="Create Your Profile"
                          className="w-full h-full object-cover scale-110 transition-all duration-500"
                        />
                      </div>
                    ),
                  },
                  {
                    step: "02",
                    title: "Organize Tournaments",
                    desc: "Organizers take the lead by creating and managing local tournaments, setting the stage and rules for the competition.",
                    icon: (
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    ),
                    visual: (
                      <div className="mt-6 relative h-48 sm:h-56 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 shadow-sm bg-white dark:bg-gray-800">
                        <img
                          src="/icons/organiser.png"
                          alt="Organize Tournaments"
                          className="w-full h-full object-cover  transition-all duration-500"
                        />
                      </div>
                    ),
                  },
                  {
                    step: "03",
                    title: "Join & Compete",
                    desc: "Players discover nearby tournaments, register their teams, and step onto the real ground to compete and showcase their skills.",
                    icon: (
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    ),
                    visual: (
                      <div className="mt-6 relative h-48 sm:h-56 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 shadow-sm bg-white dark:bg-gray-800">
                        <img
                          src="/icons/compete.png"
                          alt="Join & Compete"
                          className="w-full h-full object-cover transition-all duration-500"
                        />
                      </div>
                    ),
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-16 ${index % 2 === 1 ? "sm:flex-row-reverse" : ""}`}
                    style={{
                      opacity: useTransform(
                        scrollYProgress,
                        [
                          index * 0.33,
                          index * 0.33 + 0.12,
                          index * 0.33 + 0.28,
                          Math.min(index * 0.33 + 0.4, 1.0),
                        ],
                        [0, 1, 1, index === 2 ? 1 : 0],
                      ),
                      y: useTransform(
                        scrollYProgress,
                        [index * 0.33, index * 0.33 + 0.12],
                        [30, 0],
                      ),
                    }}
                  >
                    {/* The Timeline Node */}
                    <div className="absolute left-8 sm:left-1/2 -ml-2 sm:-ml-2.5 mt-8 sm:mt-0 sm:top-1/2 sm:-translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white dark:bg-gray-200 border-2 border-white dark:border-gray-200 flex items-center justify-center z-10 overflow-hidden shadow-sm">
                      <motion.div
                        className="w-full h-full bg-pink-500 shadow-[0_0_10px_#ec4899]"
                        style={{
                          opacity: useTransform(
                            scrollYProgress,
                            [index * 0.33, index * 0.33 + 0.12],
                            [0, 1],
                          ),
                        }}
                      />
                    </div>

                    {/* Content Card */}
                    <div
                      className={`w-full sm:w-1/2 pl-16 sm:pl-0 ${index % 2 === 0 ? "sm:pr-16 sm:text-right" : "sm:pl-16 sm:text-left"}`}
                    >
                      <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/5 dark:bg-gray-900/40 border border-[rgba(255,255,255,0.5)] dark:border-[rgba(255,255,255,0.08)] backdrop-blur-xl saturate-150 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_30px_rgba(168,85,247,0.05)] hover:bg-white/10 dark:hover:bg-gray-900/60 transition-all duration-500 overflow-hidden">
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div
                          className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? "sm:flex-row-reverse" : ""}`}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                            {item.icon}
                          </div>
                          <span className="font-display text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-100 dark:from-gray-700 dark:to-gray-900 opacity-60">
                            {item.step}
                          </span>
                        </div>

                        <h3 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10">
                          {item.desc}
                        </p>

                        <div className="relative z-10">{item.visual}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Kinetic Light Pipe Separator */}
          <div className="w-full max-w-5xl mx-auto py-10 sm:py-24 relative flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 dark:via-purple-400/30 to-transparent" />
            <div className="absolute w-2/3 h-[2px] bg-gradient-to-r from-transparent via-pink-500/50 dark:via-pink-400/50 to-transparent blur-[1px]" />
            <div className="absolute w-1/3 h-[8px] bg-gradient-to-r from-transparent via-purple-400/40 dark:via-purple-300/40 to-transparent blur-md animate-pulse" />
            <div className="relative w-8 h-8 bg-white/20 dark:bg-gray-900/50 backdrop-blur-xl border border-purple-300/40 dark:border-purple-500/40 rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20" />
              <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_#c084fc] animate-pulse" />
            </div>
          </div>

          {/* How Sportify Can Help You Section */}
          <div>
            <h2 className="font-display tracking-tight text-2xl sm:text-4xl md:text-5xl font-black text-center mb-8 sm:mb-16">
              <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
                One Platform. Three Powerful Roles.
              </span>
            </h2>

            {/* Role Cards - Glassmorphism */}
            <div className="relative">
              {/* Ambient Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 dark:from-purple-500/5 dark:via-blue-500/5 dark:to-pink-500/5 blur-[100px] -z-10 rounded-[4rem] pointer-events-none" />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Organizers Card */}
                <div className="group relative p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-purple-50/60 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-purple-800/40 backdrop-blur-xl border border-purple-200/50 dark:border-purple-400/50 hover:border-purple-400/70 dark:hover:border-purple-300/70 shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] hover:scale-[1.02] transition-all duration-500">
                  <Pointer className="text-purple-600" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-3xl transition-all duration-500" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 p-2.5 bg-slate-900/5 dark:bg-white/5 rounded-[10px] shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md border border-slate-200/50 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                      <svg
                        className="w-8 h-8 text-purple-600 dark:text-purple-400"
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
                    <h3 className="font-display text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      For Organizers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Create and manage tournaments with ease. Track
                      registrations, verify players, and handle payments
                      seamlessly.
                    </p>
                  </div>
                </div>

                {/* Players Card */}
                <div className="group relative p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-blue-50/60 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-blue-900/30 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400/70 dark:hover:border-blue-500/70 shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:scale-[1.02] transition-all duration-500">
                  <Pointer className="text-blue-600" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-3xl transition-all duration-500" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 p-2.5 bg-slate-900/5 dark:bg-white/5 rounded-[10px] shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md border border-slate-200/50 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                      <svg
                        className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
                    <h3 className="font-display text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      For Players
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Discover nearby tournaments, register digitally, and build
                      your competitive profile. Never miss an opportunity to
                      play.
                    </p>
                  </div>
                </div>

                {/* Sponsors Card */}
                <div className="group relative p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-pink-50/60 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-pink-900/30 backdrop-blur-xl border border-pink-200/50 dark:border-pink-700/50 hover:border-pink-400/70 dark:hover:border-pink-500/70 shadow-[0_0_30px_rgba(236,72,153,0.1)] hover:shadow-[0_0_40px_rgba(236,72,153,0.25)] hover:scale-[1.02] transition-all duration-500">
                  <Pointer className="text-pink-600" />
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/5 rounded-3xl transition-all duration-500" />

                  <div className="relative z-10">
                    <div className="w-16 h-16 p-2.5 bg-slate-900/5 dark:bg-white/5 rounded-[10px] shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md border border-slate-200/50 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                      <svg
                        className="w-8 h-8 text-pink-600 dark:text-pink-400"
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
                    <h3 className="font-display text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      For Sponsors
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Find relevant tournaments and promote your brand directly
                      within the sporting community. Maximize your reach and
                      impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kinetic Light Pipe Separator */}
          <div className="w-full max-w-5xl mx-auto py-16 sm:py-24 relative flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 dark:via-purple-400/30 to-transparent" />
            <div className="absolute w-2/3 h-[2px] bg-gradient-to-r from-transparent via-pink-500/50 dark:via-pink-400/50 to-transparent blur-[1px]" />
            <div className="absolute w-1/3 h-[8px] bg-gradient-to-r from-transparent via-purple-400/40 dark:via-purple-300/40 to-transparent blur-md animate-pulse" />
            <div className="relative w-8 h-8 bg-white/20 dark:bg-gray-900/50 backdrop-blur-xl border border-purple-300/40 dark:border-purple-500/40 rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20" />
              <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_#c084fc] animate-[pulse_3s_infinite]" />
            </div>
          </div>

          {/* Key Features - 2x2 Grid with Sport Icons */}
          <div>
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="font-display tracking-tight text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
                Everything you need to revolutionize sports tournaments
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="group relative p-5 sm:p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300">
                <Pointer className="text-blue-600" />
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] bg-slate-900/5 dark:bg-white/5 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden">
                    <HoverGif
                      src="/icons/location.gif"
                      alt="Location Based Discovery"
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Location-Based Discovery
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Find tournaments near you based on city and state with
                      smart geolocation
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl transition-all duration-300">
                <Pointer className="text-purple-600" />
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] bg-slate-900/5 dark:bg-white/5 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden">
                    <HoverGif
                      src="/icons/registration.gif"
                      alt="Digital Registration"
                      className="w-full h-full"
                    />
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
                <Pointer className="text-green-600" />
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] bg-slate-900/5 dark:bg-white/5 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden">
                    <HoverGif
                      src="/icons/payments.gif"
                      alt="Secure Payments"
                      className="w-full h-full"
                    />
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
                <Pointer className="text-orange-600" />
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] bg-slate-900/5 dark:bg-white/5 backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden">
                    <HoverGif
                      src="/icons/notifications.gif"
                      alt="Real-time Notifications"
                      className="w-full h-full"
                    />
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

        {/* Kinetic Light Pipe Separator */}
        <div className="w-full max-w-5xl mx-auto py-10 sm:py-16 relative flex items-center justify-center z-10">
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 dark:via-purple-400/30 to-transparent" />
          <div className="absolute w-2/3 h-[2px] bg-gradient-to-r from-transparent via-pink-500/50 dark:via-pink-400/50 to-transparent blur-[1px]" />
          <div className="absolute w-1/3 h-[8px] bg-gradient-to-r from-transparent via-purple-400/40 dark:via-purple-300/40 to-transparent blur-md animate-pulse" />
          <div className="relative w-8 h-8 bg-white/20 dark:bg-gray-900/50 backdrop-blur-xl border border-purple-300/40 dark:border-purple-500/40 rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20" />
            <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_#c084fc] animate-[pulse_4s_infinite]" />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-16 sm:pb-32">
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100/50 dark:bg-purple-900/30 border border-purple-300/50 dark:border-purple-700/50 rounded-full mb-4 sm:mb-5 backdrop-blur-sm">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">
                Frequently Asked Questions
              </span>
            </div>
            <h2 className="font-display tracking-tight text-2xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
              Got Questions?
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about Sportify
            </p>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="How do I create a tournament on Sportify?"
              answer="Creating a tournament is simple! Sign up as an organizer, complete your profile with organization details, and navigate to your dashboard. Click 'Create Tournament', fill in the tournament details including sport, venue, dates, and registration fee. Once submitted, your tournament will be visible to players across India."
              isOpen={openFAQIndex === 0}
              onToggle={() => setOpenFAQIndex(openFAQIndex === 0 ? null : 0)}
            />
            <FAQItem
              question="What types of sports tournaments can I organize?"
              answer="Sportify supports a wide range of sports including Cricket, Football, Basketball, Badminton, Volleyball, Tennis, Table Tennis, and Kabaddi. Whether you're organizing individual or team-based tournaments, our platform handles both formats seamlessly."
              isOpen={openFAQIndex === 1}
              onToggle={() => setOpenFAQIndex(openFAQIndex === 1 ? null : 1)}
            />
            <FAQItem
              question="How do players register for tournaments?"
              answer="Players can browse tournaments by location, sport, or date. Once they find a tournament, they can register individually or as a team. We require Aadhar verification for authenticity. Payment is processed securely through Razorpay, and players receive instant confirmation via email and in-app notifications."
              isOpen={openFAQIndex === 2}
              onToggle={() => setOpenFAQIndex(openFAQIndex === 2 ? null : 2)}
            />
            <FAQItem
              question="What are the payment and security measures?"
              answer="All payments are processed through Razorpay, India's leading payment gateway, ensuring bank-level security. We use SSL encryption and never store sensitive payment information. Players can pay registration fees using UPI, cards, net banking, or wallets. Organizers receive payouts after tournament completion."
              isOpen={openFAQIndex === 3}
              onToggle={() => setOpenFAQIndex(openFAQIndex === 3 ? null : 3)}
            />
            <FAQItem
              question="How does sponsorship work on Sportify?"
              answer="Sponsors can browse tournaments based on location, sport, and audience size. After selecting a tournament, sponsors can submit sponsorship proposals with their budget and benefits offered. Organizers review proposals and approve suitable sponsors. This creates win-win partnerships that support grassroots sports."
              isOpen={openFAQIndex === 4}
              onToggle={() => setOpenFAQIndex(openFAQIndex === 4 ? null : 4)}
            />
            <FAQItem
              question="Can I get a refund if a tournament is cancelled?"
              answer="Yes! If an organizer cancels a tournament, all registered players receive automatic refunds within 5-7 business days. Refunds are processed back to the original payment method. Organizers must provide a valid reason for cancellation, and our support team ensures fair resolution."
              isOpen={openFAQIndex === 5}
              onToggle={() => setOpenFAQIndex(openFAQIndex === 5 ? null : 5)}
            />
            <FAQItem
              question="How does Sportify verify player authenticity?"
              answer="We use Aadhar-based verification to ensure all players are genuine. This prevents fake registrations and maintains tournament integrity. Players need to complete profile verification with their Aadhar number before registering for any tournament. This data is encrypted and stored securely per Indian data protection laws."
              isOpen={openFAQIndex === 6}
              onToggle={() => setOpenFAQIndex(openFAQIndex === 6 ? null : 6)}
            />
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50/50 via-white/30 to-blue-50/50 dark:from-purple-900/20 dark:via-gray-800/30 dark:to-blue-900/20 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
            <h3 className="font-display text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-5">
              Our team is here to help you get started with Sportify
            </p>
            <a
              href="mailto:support@sportify.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Support
            </a>
          </div>
        </div>

        {/* Professional Footer */}
        <footer className="relative z-10 transition-colors overflow-hidden border-t border-slate-200/50 dark:border-white/5">
          {/* Subtle Top Glow & Depth */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/10 to-transparent" />
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50 dark:from-white/[0.02] to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
              {/* Brand */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src="/icon.png"
                    alt="Sportify"
                    className="w-10 h-10 rounded-xl shadow-lg"
                  />
                  <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Sportify
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                  India's premier platform for organizing, discovering, and
                  participating in local sports tournaments. Join thousands of
                  players and organizers today.
                </p>
                <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 w-fit mt-2">
                  <a
                    href="#"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow"
                  >
                    <svg
                      className="w-4 h-4"
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
                <h4 className="text-sm font-bold tracking-wider uppercase mb-4 text-slate-900 dark:text-white">
                  Quick Links
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/tournaments"
                      className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      Browse Tournaments
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/register"
                      className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/login"
                      className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      Sign In
                    </Link>
                  </li>
                </ul>
              </div>

              {/* For Users */}
              <div>
                <h4 className="text-sm font-bold tracking-wider uppercase mb-4 text-slate-900 dark:text-white">
                  For Users
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/auth/register?role=organizer"
                      className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      For Organizers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/register?role=player"
                      className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      For Players
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/register?role=sponsor"
                      className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                      For Sponsors
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2026 Sportify
              </p>
              <div className="flex gap-6 text-sm">
                <a
                  href="#"
                  className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}

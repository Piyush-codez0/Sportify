"use client";
/*
 - Used on: organizer dashboard and pages that show user actions
 - Features: Profile button, logout, navigation controls
*/
import { LogOut, User, Bell, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface DashboardNavbarProps {
  title: string;
  userName: string;
  userProfileComplete: boolean;
  userPhoneVerified: boolean;
  onProfileClick: () => void;
  onLogout: () => void;
  stats?: { label: string; value: string | number }[];
  notificationCount?: number;
  userGender?: string;
}

export default function DashboardNavbar({
  title,
  userName,
  userProfileComplete,
  userPhoneVerified,
  onProfileClick,
  onLogout,
  stats,
  notificationCount = 0,
  userGender,
}: DashboardNavbarProps) {
  const router = useRouter();
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isProfileVerified = userProfileComplete && userPhoneVerified;
  const [greeting, setGreeting] = useState("Welcome");

  // Determine Avatar URL based on gender and username
  const avatarUrl = (() => {
    const baseSeed = userName || "User";
    // Including gender in the seed ensures different characters are generated
    if (userGender?.toLowerCase() === "male") {
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=male-${encodeURIComponent(baseSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    } else if (userGender?.toLowerCase() === "female") {
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=female-${encodeURIComponent(baseSeed)}&backgroundColor=ffd5dc,ffdfbf,ffd5dc`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=neutral-${encodeURIComponent(baseSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  })();

  useEffect(() => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        timeZone: 'Asia/Kolkata', 
        hour: 'numeric', 
        hour12: false 
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const hour = parseInt(formatter.format(new Date()));
      
      if (hour >= 5 && hour < 12) setGreeting("Good morning");
      else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
      else if (hour >= 17 && hour < 21) setGreeting("Good evening");
      else setGreeting("Hello");
    } catch (e) {
      // Fallback to local time if timezone is not supported
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    }
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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

  return (
    <>
      <nav
      className={`fixed left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-500 ${isNavHidden ? "-top-24" : "top-0"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center gap-4">
          
          {/* Left: Back Button, Avatar & Greeting */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all flex shrink-0"
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="relative shrink-0 cursor-pointer group" onClick={onProfileClick}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50 shadow-sm group-hover:scale-105 transition-transform bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-indigo-100');
                  }}
                />
              </div>
              {!isProfileVerified && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full" title="Profile incomplete"></span>
              )}
            </div>
            
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <p className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                  {title}
                </p>
                {stats && stats.length > 0 && (
                  <div className="hidden md:flex items-center gap-2 border-l border-gray-300 dark:border-gray-700 pl-2 ml-1">
                    {stats.map((stat, idx) => (
                      <span key={idx} className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                        {stat.label}: <span className="font-bold text-gray-900 dark:text-gray-100">{stat.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h1 className="text-sm sm:text-lg font-extrabold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                {greeting}, {userName.split(' ')[0]} <span className="text-lg">👋</span>
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <button className="relative p-2.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Notifications">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-gray-900"></span>
              )}
            </button>
            
            {/* Profile Button */}
            <button
              onClick={onProfileClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all duration-200 shadow-sm"
            >
              <User size={16} />
              <span>Profile</span>
            </button>
            
            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
              className={`flex items-center justify-center p-2.5 sm:px-4 sm:py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm group border ${
                showLogoutConfirm 
                  ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800/30"
              }`}
              title="Logout"
            >
              <LogOut
                size={18}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              <span className="hidden sm:inline ml-2">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* Logout Confirmation Popover - Moved to root to escape stacking contexts */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            {/* Global transparent backdrop - now covers the entire viewport unconditionally */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 z-[100] bg-black/5 dark:bg-black/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed right-4 top-20 w-64 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-2xl border border-gray-100 dark:border-white/10 z-[110] overflow-hidden"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Confirm Logout</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Are you sure you want to exit?</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

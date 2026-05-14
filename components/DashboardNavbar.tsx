"use client";
/*
 - Used on: organizer dashboard and pages that show user actions
 - Features: Profile button, logout, navigation controls
*/
import { LogOut, User, Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardNavbarProps {
  title: string;
  userName: string;
  userProfileComplete: boolean;
  userPhoneVerified: boolean;
  onProfileClick: () => void;
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
  const [isNavHidden, setIsNavHidden] = useState(false);
  const isProfileVerified = userProfileComplete && userPhoneVerified;
  const [greeting, setGreeting] = useState("Welcome");

  // Determine Avatar URL based on gender and username
  const avatarUrl = (() => {
    const seed = encodeURIComponent(userName || "User");
    if (userGender?.toLowerCase() === "male") {
      return `https://avatar.iran.liara.run/public/boy?username=${seed}`;
    } else if (userGender?.toLowerCase() === "female") {
      return `https://avatar.iran.liara.run/public/girl?username=${seed}`;
    }
    return `https://avatar.iran.liara.run/public?username=${seed}`;
  })();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
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
    <div
      className={`fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ${isNavHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center gap-4">
          
          {/* Left: Avatar & Greeting */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative shrink-0 cursor-pointer group" onClick={onProfileClick}>
              <img
                src={avatarUrl}
                alt={userName}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/50 shadow-sm group-hover:scale-105 transition-transform bg-white/50"
              />
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
            
            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 font-semibold transition-all duration-200 shadow-sm group border border-transparent hover:border-red-200 dark:hover:border-red-800/30"
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
    </div>
  );
}

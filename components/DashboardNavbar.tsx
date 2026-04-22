"use client";
import { LogOut, User } from "lucide-react";

interface DashboardNavbarProps {
  title: string;
  userName: string;
  userProfileComplete: boolean;
  userPhoneVerified: boolean;
  onProfileClick: () => void;
  onLogout: () => void;
}

export default function DashboardNavbar({
  title,
  userName,
  userProfileComplete,
  userPhoneVerified,
  onProfileClick,
  onLogout,
}: DashboardNavbarProps) {
  const isProfileVerified = userProfileComplete && userPhoneVerified;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <img
              src="/icon.png"
              alt="Sportify"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-md flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white transition-colors truncate">
                {title}
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 transition-colors truncate">
                Welcome, {userName}
              </p>
            </div>
          </div>

          {/* Right: Profile and Logout Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <button
              onClick={onProfileClick}
              className="flex items-center gap-1.5 sm:gap-2 p-2 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 font-medium transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <img
                src={
                  isProfileVerified
                    ? "https://t4.ftcdn.net/jpg/15/25/88/35/360_F_1525883513_jKfrd0siKwgg0vdNFL10xafVcjIOjxel.jpg"
                    : "https://t3.ftcdn.net/jpg/07/51/48/94/360_F_751489462_vwzozYQfB2rQXOYyOrU7sF2awHI2jTEg.jpg"
                }
                alt="Profile"
                className="w-5 h-5 rounded transition-transform group-hover:scale-110"
              />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 sm:gap-2 p-2 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <LogOut
                size={18}
                className="transition-transform group-hover:scale-110"
              />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import DashboardNavbar from "@/components/DashboardNavbar";
import ProfileModal from "@/components/ProfileModal";

interface Registration {
  _id: string;
  status: string;
  paymentStatus: string;
  registrationType: string;
  tournament: {
    _id: string;
    name: string;
    sport: string;
    city: string;
    state: string;
    startDate: string;
    entryFee: number;
  };
}

export default function PlayerDashboard() {
  const { user, logout } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/registrations/my-registrations", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setRegistrations(data.registrations);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!user || user.role !== "player")
    return <div className="p-6">Access denied.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040812] relative transition-colors overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px]" />
      </div>

      <DashboardNavbar
        title="Player Dashboard"
        userName={user?.name || "User"}
        userProfileComplete={Boolean(user?.city && user?.state && user?.gender)}
        userPhoneVerified={Boolean(user?.phoneVerified)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={logout}
        userGender={user?.gender}
      />
      <div className="pt-20 sm:pt-24 max-w-5xl mx-auto p-3 sm:p-6 relative z-10">
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded border border-red-200 dark:border-red-800 transition-colors">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-gray-900 dark:text-white transition-colors">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registrations.map((r) => (
              <div
                key={r._id}
                className="border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 shadow transition-colors"
              >
                <h2 className="font-semibold text-gray-900 dark:text-white transition-colors">
                  {r.tournament.name}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors">
                  {r.tournament.sport} • {r.tournament.city},{" "}
                  {r.tournament.state}
                </p>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 transition-colors">
                  Starts:{" "}
                  {new Date(r.tournament.startDate).toLocaleDateString("en-GB")}
                </p>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 transition-colors">
                  Type: {r.registrationType}
                </p>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 transition-colors">
                  Payment: {r.paymentStatus}
                </p>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 transition-colors">
                  Status: {r.status}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/tournaments/${r.tournament._id}`}
                    className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline transition-colors"
                  >
                    View Tournament
                  </Link>
                </div>
              </div>
            ))}
            {registrations.length === 0 && (
              <div className="col-span-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-5xl w-full relative -mt-16 sm:-mt-24"
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative inline-block">
                      <img 
                        src="/icons/No reg.png" 
                        alt="No registrations" 
                        className="w-72 h-72 sm:w-[550px] sm:h-[550px] object-contain relative z-10 dark:hidden"
                      />
                      <img 
                        src="/icons/no-reg-dark.png" 
                        alt="No registrations" 
                        className="w-72 h-72 sm:w-[550px] sm:h-[550px] object-contain relative z-10 hidden dark:block"
                      />
                    </div>
                    
                   
                    <Link
                      href="/tournaments"
                      className="inline-flex items-center justify-center px-8 py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all duration-300"
                    >
                      <span>Explore Tournaments</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

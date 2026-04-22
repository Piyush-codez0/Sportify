"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
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
  const { user, token, logout } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch("/api/registrations/my-registrations", {
          headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  if (!user || user.role !== "player")
    return <div className="p-6">Access denied.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 relative transition-colors">
      <SportsDoodlesBackground />
      <DashboardNavbar
        title="Player Dashboard"
        userName={user?.name || "User"}
        userProfileComplete={Boolean(user?.city && user?.state && user?.gender)}
        userPhoneVerified={Boolean(user?.phoneVerified)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={logout}
      />
      <div className="pt-20 sm:pt-24 max-w-5xl mx-auto p-3 sm:p-6 relative z-10">
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
        <div className="mb-4">
          <Link
            href="/tournaments"
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium transition-colors"
          >
            ← Browse Tournaments
          </Link>
        </div>
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
              <div className="text-gray-600 dark:text-gray-300 transition-colors">
                No registrations yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

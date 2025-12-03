"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
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
      <div className="max-w-5xl mx-auto p-6 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <img
              src="/icon.png"
              alt="Sportify"
              className="w-12 h-12 rounded-xl shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Player Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                Welcome, {user?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowProfile(true)}
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 font-medium transition-colors flex items-center gap-2"
            >
              <img
                src={
                  user?.city &&
                  user?.state &&
                  user?.gender &&
                  user?.phoneVerified
                    ? "https://t4.ftcdn.net/jpg/15/25/88/35/360_F_1525883513_jKfrd0siKwgg0vdNFL10xafVcjIOjxel.jpg"
                    : "https://t3.ftcdn.net/jpg/07/51/48/94/360_F_751489462_vwzozYQfB2rQXOYyOrU7sF2awHI2jTEg.jpg"
                }
                alt="Profile"
                className="w-5 h-5 rounded"
              />
              Profile
            </button>
            <button
              onClick={logout}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
        <div className="mb-4">
          <Link
            href="/tournaments"
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm transition-colors"
          >
            Browse Tournaments
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
          <div className="grid md:grid-cols-2 gap-4">
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

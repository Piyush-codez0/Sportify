"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  status: string;
  currentParticipants: number;
  maxParticipants: number;
}

export default function OrganizerDashboard() {
  const { user, token, logout } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch("/api/organizer/tournaments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setTournaments(data.tournaments);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (!user || user.role !== "organizer") {
    return <div className="p-6">Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 relative transition-colors">
      <SportsDoodlesBackground />
      <div className="p-6 max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              Organizer Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
              Welcome, {user?.name}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/organizer/tournaments/new"
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Organise a Tournament
            </Link>
            <button
              onClick={logout}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800 transition-colors">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-gray-900 dark:text-white transition-colors">
            Loading...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tournaments.map((t) => (
              <div
                key={t._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow transition-colors"
              >
                <h2 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white transition-colors">
                  {t.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                  {t.sport} • {t.city}, {t.state}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                  {new Date(t.startDate).toLocaleDateString()} -{" "}
                  {new Date(t.endDate).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm text-gray-900 dark:text-white transition-colors">
                  Participants: {t.currentParticipants}/{t.maxParticipants}
                </p>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 transition-colors">
                  Status: <span className="font-medium">{t.status}</span>
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/organizer/tournaments/${t._id}/registrations`}
                    className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline transition-colors"
                  >
                    Registrations
                  </Link>
                </div>
              </div>
            ))}
            {tournaments.length === 0 && (
              <div className="text-gray-600 dark:text-gray-300 transition-colors">
                No tournaments are organised by you yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

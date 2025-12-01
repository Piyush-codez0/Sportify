"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  city: string;
  state: string;
  status: string;
  currentParticipants: number;
  maxParticipants: number;
  entryFee: number;
  prizePool?: number;
  ageGroup?: string;
  contactEmail?: string;
  contactPhone?: string;
  allowTeamRegistration: boolean;
  teamSize?: number;
}

interface Sponsorship {
  _id: string;
  status: string;
  amount: number;
  sponsorshipType: string;
  message?: string;
  sponsor: {
    companyName?: string;
    email: string;
    phone?: string;
  };
  tournament: {
    _id: string;
    name: string;
    sport: string;
  };
}

export default function OrganizerDashboard() {
  const { user, token, logout } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [tRes, sRes] = await Promise.all([
          fetch("/api/organizer/tournaments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/organizer/sponsorships", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const tData = await tRes.json();
        const sData = await sRes.json();
        if (!tRes.ok) throw new Error(tData.error || "Failed tournaments");
        if (!sRes.ok) throw new Error(sData.error || "Failed sponsorships");
        setTournaments(tData.tournaments);
        setSponsorships(sData.sponsorships);
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
          <>
            {sponsorships.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                  Sponsorship Requests
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {sponsorships.map((s) => (
                    <div
                      key={s._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">
                        {s.sponsor.companyName || "Sponsor"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                        Tournament: {s.tournament.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                        Amount: ₹{s.amount} • Type: {s.sponsorshipType}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                        Contact: {s.sponsor.email}
                      </p>
                      {s.message && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors">
                          Message: {s.message}
                        </p>
                      )}
                      <p
                        className={`text-sm font-semibold mt-2 ${
                          s.status === "pending"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : s.status === "approved"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        Status: {s.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              Your Tournaments
            </h2>
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
                    {t.sport}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    <span className="font-medium">Venue:</span> {t.venue}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    <span className="font-medium">Location:</span> {t.city},{" "}
                    {t.state}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    <span className="font-medium">Starts:</span>{" "}
                    {new Date(t.startDate).toLocaleDateString("en-GB")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                    <span className="font-medium">Registration Deadline:</span>{" "}
                    {new Date(t.registrationDeadline).toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                    <span className="font-medium">Entry Fee:</span> ₹
                    {t.entryFee}
                    {t.prizePool && ` • Prize Pool: ₹${t.prizePool}`}
                  </p>
                  {t.ageGroup && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                      <span className="font-medium">Age Group:</span>{" "}
                      {t.ageGroup}
                    </p>
                  )}
                  {(t.contactEmail || t.contactPhone) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                      <span className="font-medium">Contact:</span>{" "}
                      {t.contactPhone || t.contactEmail}
                    </p>
                  )}
                  <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-200 dark:border-indigo-700 transition-colors">
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 transition-colors">
                      Participants: {t.currentParticipants}/{t.maxParticipants}
                      {t.allowTeamRegistration &&
                        t.teamSize &&
                        ` (Team size: ${t.teamSize})`}
                    </p>
                    <p className="text-sm font-semibold mt-1 transition-colors">
                      Status:{" "}
                      <span
                        className={
                          t.status === "open"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {t.status}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/organizer/tournaments/${t._id}/registrations`}
                      className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline transition-colors"
                    >
                      Registered Players
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
          </>
        )}
      </div>
    </div>
  );
}

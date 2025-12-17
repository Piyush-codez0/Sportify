"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { MapPin, CalendarDays, Users, IndianRupee, Trophy } from "lucide-react";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import ProfileModal from "@/components/ProfileModal";

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
  benefits?: string[];
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
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"sponsorships" | "tournaments">(
    "tournaments"
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          <div className="flex items-center gap-4">
            <img
              src="/icon.png"
              alt="Sportify"
              className="w-12 h-12 rounded-xl shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Organizer Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                Welcome, {user?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/organizer/tournaments/new"
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Organise a Tournament
            </Link>
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

        {/* Navigation Bar */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 flex gap-2 transition-colors">
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "tournaments"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Your Tournaments
            {tournaments.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                {tournaments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sponsorships")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "sponsorships"
                ? "bg-indigo-50 text-indigo-700 dark:bg-gray-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Sponsorship Requests
            {sponsorships.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {sponsorships.length}
              </span>
            )}
          </button>
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
            {activeTab === "sponsorships" && sponsorships.length > 0 && (
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
                        Sponser: {s.tournament.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                        Amount: ₹{s.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                        Contact: {s.sponsor.email}
                        {s.sponsor.phone && ` • ${s.sponsor.phone}`}
                      </p>
                      {s.message && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors">
                          <span className="font-semibold">Message:</span>{" "}
                          {s.message}
                        </p>
                      )}
                      {s.benefits && s.benefits.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Benefits:
                          </p>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                            {s.benefits.map((benefit: string, idx: number) => (
                              <li key={idx}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {s.status === "approved" && (
                        <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            ✓ Sponsorship Accepted
                          </p>
                        </div>
                      )}
                      {s.status === "rejected" && (
                        <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                            ✗ Sponsorship Declined
                          </p>
                        </div>
                      )}
                      {s.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `/api/organizer/sponsorships/manage`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      sponsorshipId: s._id,
                                      action: "approve",
                                    }),
                                  }
                                );
                                const data = await res.json();
                                if (!res.ok)
                                  throw new Error(
                                    data.error || "Failed to approve"
                                  );
                                setSponsorships((prev) =>
                                  prev.map((sp) =>
                                    sp._id === s._id
                                      ? { ...sp, status: "approved" }
                                      : sp
                                  )
                                );
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `/api/organizer/sponsorships/manage`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      sponsorshipId: s._id,
                                      action: "reject",
                                    }),
                                  }
                                );
                                const data = await res.json();
                                if (!res.ok)
                                  throw new Error(
                                    data.error || "Failed to reject"
                                  );
                                setSponsorships((prev) =>
                                  prev.map((sp) =>
                                    sp._id === s._id
                                      ? { ...sp, status: "rejected" }
                                      : sp
                                  )
                                );
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "sponsorships" && sponsorships.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 transition-colors">
                  No sponsorship requests yet.
                </p>
              </div>
            )}
            {activeTab === "tournaments" && (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                  Your Tournaments
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {tournaments.map((t) => (
                    <div
                      key={t._id}
                      className="group relative border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {t.sport} <span>Tournament</span>
                        </h2>
                        {t.prizePool && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300/60">
                            <Trophy className="w-3 h-3" /> ₹{t.prizePool}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Venue:</span> {t.venue}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Location:</span>{" "}
                          {t.city}, {t.state}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CalendarDays className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Starts:</span>{" "}
                          {new Date(t.startDate).toLocaleDateString("en-GB")}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CalendarDays className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">
                            Registration Deadline:
                          </span>{" "}
                          {new Date(t.registrationDeadline).toLocaleDateString(
                            "en-GB"
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <IndianRupee className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-medium">Entry Fee:</span> ₹
                          {t.entryFee}
                        </div>
                      </div>
                      {t.ageGroup && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Age Group:</span>{" "}
                          {t.ageGroup}
                        </div>
                      )}
                      {(t.contactEmail || t.contactPhone) && (
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Contact:</span>{" "}
                          {t.contactPhone || t.contactEmail}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                          <Users className="w-3.5 h-3.5" />
                          {t.currentParticipants}/{t.maxParticipants}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                            t.status === "open"
                              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                              : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                          }`}
                        >
                          {t.status === "open" ? "Open" : "Closed"}
                        </span>
                        {t.allowTeamRegistration && t.teamSize && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            Team size: {t.teamSize}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/organizer/tournaments/${t._id}/registrations`}
                          className="flex-1 text-center bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
                        >
                          Registered Players
                        </Link>
                        <button
                          onClick={async () => {
                            if (
                              !confirm(
                                `Are you sure you want to delete ${t.sport} Tournament? This action cannot be undone.`
                              )
                            ) {
                              return;
                            }
                            setDeletingId(t._id);
                            try {
                              const res = await fetch(
                                `/api/tournaments/${t._id}`,
                                {
                                  method: "DELETE",
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );
                              const data = await res.json();
                              if (!res.ok)
                                throw new Error(
                                  data.error || "Failed to delete tournament"
                                );
                              setTournaments((prev) =>
                                prev.filter(
                                  (tournament) => tournament._id !== t._id
                                )
                              );
                              alert("Tournament deleted successfully!");
                            } catch (e: any) {
                              alert(e.message);
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === t._id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors disabled:bg-red-400 disabled:cursor-not-allowed shadow-sm"
                        >
                          {deletingId === t._id ? "Deleting..." : "Delete"}
                        </button>
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
          </>
        )}
      </div>
    </div>
  );
}

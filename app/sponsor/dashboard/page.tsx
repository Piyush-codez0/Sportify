"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import ProfileModal from "@/components/ProfileModal";

interface Sponsorship {
  _id: string;
  status: string;
  sponsorshipType: string;
  amount: number;
  tournament: {
    name: string;
    sport: string;
    city: string;
    state: string;
    startDate: string;
  };
}

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  city: string;
  state: string;
  venue: string;
  startDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool?: number;
  ageGroup?: string;
  contactEmail?: string;
  contactPhone?: string;
  allowTeamRegistration: boolean;
  teamSize?: number;
  organizer?: {
    name: string;
    organizationName?: string;
  };
}

function SponsorDashboardContent() {
  const { user, token, logout } = useAuth();
  const searchParams = useSearchParams();
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [form, setForm] = useState({
    amount: "",
    benefits: "",
    message: "",
  });
  const [msg, setMsg] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [sRes, tRes] = await Promise.all([
          fetch("/api/sponsor/sponsorships", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/tournaments"),
        ]);
        const sData = await sRes.json();
        const tData = await tRes.json();
        if (!sRes.ok) throw new Error(sData.error || "Failed sponsorships");
        if (!tRes.ok) throw new Error(tData.error || "Failed tournaments");
        setSponsorships(sData.sponsorships);
        setTournaments(tData.tournaments);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // Preselect tournament when navigated with ?tournamentId=
  useEffect(() => {
    const tid = searchParams?.get("tournamentId");
    if (!tid || tournaments.length === 0) return;
    const found = tournaments.find((t) => t._id === tid);
    if (found) {
      setSelectedTournament(found);
      setShowBrowse(false);
    }
  }, [searchParams, tournaments]);

  const submit = async (e: any) => {
    e.preventDefault();
    if (!selectedTournament) {
      setMsg("Please select a tournament");
      return;
    }
    setMsg("");
    setCreating(true);
    try {
      const payload = {
        tournamentId: selectedTournament._id,
        amount: parseFloat(form.amount),
        sponsorshipType: "gold",
        benefits: form.benefits
          ? form.benefits.split(",").map((b) => b.trim())
          : [],
        message: form.message,
      };
      const res = await fetch("/api/sponsor/sponsorships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSponsorships((prev) => [data.sponsorship, ...prev]);
      setMsg("Sponsorship request submitted");
      setForm({
        amount: "",
        benefits: "",
        message: "",
      });
      setSelectedTournament(null);
      setShowBrowse(false);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setCreating(false);
    }
  };

  if (!user || user.role !== "sponsor")
    return <div className="p-6">Access denied.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 relative transition-colors">
      <SportsDoodlesBackground />
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <img
              src="/icon.png"
              alt="Sportify"
              className="w-12 h-12 rounded-xl shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                Sponsor Dashboard
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
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded border border-red-200 dark:border-red-800 transition-colors">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border border-gray-200 dark:border-gray-700 rounded p-4 bg-white dark:bg-gray-800 shadow transition-colors">
            <h2 className="font-semibold mb-3 text-gray-900 dark:text-white transition-colors">
              New Sponsorship
            </h2>
            <form onSubmit={submit} className="space-y-3">
              <div className="border border-gray-300 dark:border-gray-600 p-3 rounded bg-gray-50 dark:bg-gray-700/50 transition-colors">
                {selectedTournament ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedTournament.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {selectedTournament.sport} • {selectedTournament.city},{" "}
                      {selectedTournament.state}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedTournament(null)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                    >
                      Change Tournament
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tournament selected
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowBrowse(!showBrowse)}
                className="bg-gray-700 dark:bg-gray-600 text-white px-4 py-2 rounded w-full hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors"
              >
                {showBrowse ? "Hide Tournaments" : "Browse Tournaments"}
              </button>
              <input
                placeholder="Amount (INR)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                required
              />
              <input
                placeholder="Benefits (comma separated)"
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              />
              <textarea
                placeholder="Message to organizer"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                rows={3}
              />
              <button
                disabled={creating || !selectedTournament}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded w-full hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? "Submitting..." : "Submit Sponsorship"}
              </button>
              {msg && (
                <div className="text-xs mt-1 text-gray-600 dark:text-gray-300 transition-colors">
                  {msg}
                </div>
              )}
            </form>
          </div>
          <div className="md:col-span-2 space-y-4">
            {showBrowse ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white transition-colors">
                    Browse Tournaments
                  </h2>
                  <button
                    onClick={() => setShowBrowse(false)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    ✕ Close
                  </button>
                </div>
                {loading ? (
                  <div className="text-gray-900 dark:text-white transition-colors">
                    Loading...
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                    {tournaments.map((t) => (
                      <div
                        key={t._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedTournament(t);
                          setShowBrowse(false);
                        }}
                      >
                        <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white transition-colors">
                          {t.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                          {t.sport}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                          <span className="font-medium">Venue:</span> {t.venue}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                          <span className="font-medium">Location:</span>{" "}
                          {t.city}, {t.state}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                          <span className="font-medium">Starts:</span>{" "}
                          {new Date(t.startDate).toLocaleDateString("en-GB")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                          <span className="font-medium">
                            Registration Deadline:
                          </span>{" "}
                          {new Date(t.registrationDeadline).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                          <span className="font-medium">Participants:</span>{" "}
                          {t.currentParticipants}/{t.maxParticipants}
                          {t.allowTeamRegistration &&
                            t.teamSize &&
                            ` (Team size: ${t.teamSize})`}
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
                        <button className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm hover:underline transition-colors">
                          Select Tournament →
                        </button>
                      </div>
                    ))}
                    {tournaments.length === 0 && (
                      <div className="text-gray-600 dark:text-gray-300 transition-colors">
                        No tournaments available.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white transition-colors">
                  Your Sponsorships
                </h2>
                {loading ? (
                  <div className="text-gray-900 dark:text-white transition-colors">
                    Loading...
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {sponsorships.map((s) => (
                      <div
                        key={s._id}
                        className="border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 shadow transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">
                          {s.tournament.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors">
                          {s.tournament.sport} • {s.tournament.city}
                        </p>
                        <p className="text-xs mt-1 text-gray-600 dark:text-gray-300 transition-colors">
                          Amount: ₹{s.amount.toLocaleString()}
                        </p>
                        {s.status === "approved" && (
                          <>
                            <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                                ✓ Your Sponsorship is Accepted
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                alert(
                                  `Payment Demo:\n\nSponsorship Amount: ₹${s.amount}\nTournament: ${s.tournament.name}\n\nIn production, this would open a payment gateway (Razorpay, Stripe, etc.)\n\nPayment processed successfully! ✓`
                                );
                              }}
                              className="mt-3 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                            >
                              💳 Pay ₹{s.amount.toLocaleString()}
                            </button>
                          </>
                        )}
                        {s.status === "rejected" && (
                          <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                              ✗ Your Sponsorship is Declined
                            </p>
                          </div>
                        )}
                        {s.status === "pending" && (
                          <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-2 text-xs text-yellow-700 dark:text-yellow-300">
                            ⏳ Awaiting organizer approval
                          </div>
                        )}
                      </div>
                    ))}
                    {sponsorships.length === 0 && (
                      <div className="text-gray-600 dark:text-gray-300 transition-colors">
                        No sponsorships yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SponsorDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SponsorDashboardContent />
    </Suspense>
  );
}

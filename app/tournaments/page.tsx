"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import DashboardNavbar from "@/components/DashboardNavbar";
import { INDIAN_STATES } from "@/lib/indianStates";
import { INDIAN_DISTRICTS } from "@/lib/indianDistricts";

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  city: string;
  state: string;
  startDate: string;
  endDate?: string;
  registrationDeadline?: string;
  status?: string;
  entryFee: number;
  prizePool?: number;
  createdAt?: string;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  googleMapsLink?: string;
  organizer?: {
    _id: string;
    name: string;
    organizationName?: string;
  };
}

// Helper: get tournament status tag info
function getTournamentStatus(t: Tournament): {
  label: string;
  emoji: string;
  ribbonBg: string;
  tagBg: string;
  tagText: string;
  isActive: boolean;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const endDate = t.endDate ? new Date(t.endDate) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);

  const deadline = t.registrationDeadline ? new Date(t.registrationDeadline) : null;
  if (deadline) deadline.setHours(0, 0, 0, 0);

  const isEnded =
    (endDate && endDate < now) ||
    t.status === "completed" ||
    t.status === "cancelled";

  const isOngoing = t.status === "ongoing";

  const isRegistrationClosed =
    !isEnded &&
    ((deadline && deadline < now) ||
      t.status === "closed");

  if (isEnded) {
    return {
      label: t.status === "cancelled" ? "Cancelled" : "Tournament Ended",
      emoji: "⚠️",
      ribbonBg: "from-gray-500 to-gray-600",
      tagBg: "bg-gray-100 dark:bg-gray-700",
      tagText: "text-gray-600 dark:text-gray-300",
      isActive: false,
    };
  }

  if (isOngoing) {
    return {
      label: "Ongoing",
      emoji: "🟢",
      ribbonBg: "from-green-500 to-emerald-600",
      tagBg: "bg-green-100 dark:bg-green-900/40",
      tagText: "text-green-700 dark:text-green-400",
      isActive: false,
    };
  }

  if (isRegistrationClosed) {
    return {
      label: "Registration Closed",
      emoji: "🔒",
      ribbonBg: "from-red-500 to-orange-500",
      tagBg: "bg-red-100 dark:bg-red-900/40",
      tagText: "text-red-700 dark:text-red-400",
      isActive: false,
    };
  }

  return {
    label: "Open",
    emoji: "✅",
    ribbonBg: "",
    tagBg: "bg-green-100 dark:bg-green-900/40",
    tagText: "text-green-700 dark:text-green-400",
    isActive: true,
  };
}

export default function TournamentsBrowse() {
  const { token, user } = useAuth();
  const [filters, setFilters] = useState({
    district: "",
    state: "",
    sport: "",
    useRadius: false,
    radiusKm: "10",
    showOnlyActive: false,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTournaments = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.district) params.set("district", filters.district);
      if (filters.state) params.set("state", filters.state);
      if (filters.sport) params.set("sport", filters.sport);
      if (filters.useRadius && location) {
        params.set("lat", location.lat.toString());
        params.set("lng", location.lng.toString());
        params.set("radiusKm", filters.radiusKm);
      }
      const res = await fetch(`/api/tournaments?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      const sortedTournaments = data.tournaments.sort((a: Tournament, b: Tournament) => {
        return b._id.localeCompare(a._id);
      });
      setTournaments(sortedTournaments);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.useRadius && !location) return;
    fetchTournaments();
  }, [
    filters.state,
    filters.district,
    filters.sport,
    filters.useRadius,
    filters.radiusKm,
    location,
  ]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError("Failed to get location")
    );
  };

  const activeCount = tournaments.filter(
    (t) => getTournamentStatus(t).isActive
  ).length;

  const displayedTournaments = filters.showOnlyActive
    ? tournaments.filter((t) => getTournamentStatus(t).isActive)
    : tournaments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 relative transition-colors">
      <SportsDoodlesBackground />
      {token && (
        <DashboardNavbar
          title="Browse Tournaments"
          userName={user?.name || "User"}
          userProfileComplete={Boolean(
            user?.city && user?.state && user?.gender
          )}
          userPhoneVerified={Boolean(user?.phoneVerified)}
          onProfileClick={() => {}}
          onLogout={() => {}}
        />
      )}
      <div
        className={`${
          token ? "pt-24" : "pt-8"
        } max-w-6xl mx-auto px-4 pb-12 relative z-10`}
      >
        {/* Page Header */}
        {!token && (
          <div className="text-center mb-10">
            
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Challenges</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              Find and join premier sports tournaments in your area. Compete, grow, and connect with the community.
            </p>
          </div>
        )}

        {/* Premium Filter Card */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 mb-8 relative overflow-hidden group">
          {/* Subtle Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-gradient-to-b from-indigo-500/5 to-transparent blur-3xl -z-10 group-hover:from-indigo-500/10 transition-colors duration-500"></div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 relative z-10">
            <div className="relative group/input">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-widest ml-1">
                State
              </label>
              <div className="relative">
                <select
                  value={filters.state}
                  onChange={(e) =>
                    setFilters({ ...filters, state: e.target.value, district: "" })
                  }
                  className="w-full appearance-none border border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white px-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={filters.useRadius}
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/input:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative group/input">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-widest ml-1">
                District
              </label>
              <div className="relative">
                <select
                  value={filters.district}
                  onChange={(e) =>
                    setFilters({ ...filters, district: e.target.value })
                  }
                  className="w-full appearance-none border border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white px-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!filters.state || filters.useRadius}
                >
                  <option value="">All Districts</option>
                  {filters.state &&
                    INDIAN_DISTRICTS[filters.state]?.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/input:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative group/input">
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-widest ml-1">
                Sport
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover/input:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  placeholder="e.g. Football, Chess..."
                  value={filters.sport}
                  onChange={(e) =>
                    setFilters({ ...filters, sport: e.target.value })
                  }
                  className="w-full border border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white pl-11 pr-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400 shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Stats & Reset Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 relative z-10">
            {!loading && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    {displayedTournaments.length}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    results found
                  </span>
                  {activeCount > 0 && activeCount < tournaments.length && !filters.showOnlyActive && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {activeCount} active
                      </span>
                    </>
                  )}
                </div>

                <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl sm:ml-auto">
                  <button
                    onClick={() => setFilters({ ...filters, showOnlyActive: false })}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${!filters.showOnlyActive ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    All Tournaments
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, showOnlyActive: true })}
                    className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${filters.showOnlyActive ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    Available Only
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setFilters({ district: "", state: "", sport: "", useRadius: false, radiusKm: "10", showOnlyActive: false });
                setLocation(null);
              }}
              className="flex items-center justify-center gap-2 text-sm bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all font-semibold shadow-sm hover:shadow active:scale-95 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
          </div>
        </div>

        {/* ── FIND NEAR ME — Separate Card ──────────────────────── */}
        <div
          className={`relative mb-6 rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ${
            filters.useRadius
              ? "ring-2 ring-emerald-400 dark:ring-emerald-500 shadow-emerald-400/30"
              : "hover:shadow-xl"
          }`}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600" />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
            {/* Left: text */}
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                📍 Find Tournaments Near Me
              </p>
              <p className="text-white/75 text-xs mt-0.5">
                Use your GPS location to discover nearby tournaments
              </p>
            </div>

            {/* Right: button + radius */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Radius input — shows when active */}
              {filters.useRadius && (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <input
                    type="number"
                    value={filters.radiusKm}
                    min={1}
                    max={200}
                    onChange={(e) => setFilters({ ...filters, radiusKm: e.target.value })}
                    className="w-12 bg-transparent text-white text-sm text-center font-bold focus:outline-none placeholder:text-white/60"
                  />
                  <span className="text-xs text-white/80 font-semibold">km</span>
                </div>
              )}

              <button
                onClick={() => {
                  const next = !filters.useRadius;
                  setFilters({ ...filters, useRadius: next });
                  if (next && !location) getLocation();
                }}
                className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 select-none overflow-hidden ${
                  filters.useRadius
                    ? "bg-white text-emerald-700 shadow-lg scale-[1.03]"
                    : "bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 hover:scale-[1.02] hover:shadow-md"
                }`}
              >
                {/* Shimmer on active */}
                {filters.useRadius && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/60 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />
                )}

                {/* Pulsing pin icon */}
                <span className="relative flex-shrink-0">
                  {filters.useRadius && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
                  )}
                  <svg
                    className={`w-4 h-4 relative z-10 ${filters.useRadius ? "text-emerald-600" : "text-white"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>

                <span className="relative z-10">
                  {filters.useRadius ? "✓ Searching" : "Enable"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-white/60 dark:bg-gray-800/60 rounded-2xl animate-pulse border border-gray-200 dark:border-gray-700"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {displayedTournaments.map((t) => {
              const status = getTournamentStatus(t);
              const isInactive = !status.isActive;

              // Sport-specific color gradient for card header
              const sportColors: Record<string, string> = {
                football: "from-emerald-500 to-teal-600",
                cricket: "from-yellow-500 to-orange-500",
                chess: "from-slate-600 to-gray-800",
                badminton: "from-sky-500 to-blue-600",
                tennis: "from-lime-500 to-green-600",
                kabaddi: "from-orange-500 to-red-500",
                basketball: "from-orange-400 to-rose-500",
                volleyball: "from-cyan-500 to-blue-500",
                "table tennis": "from-red-500 to-pink-600",
                athletics: "from-violet-500 to-purple-600",
                "kho-kho": "from-amber-500 to-yellow-600",
              };
              const sportKey = t.sport.toLowerCase();
              const headerGradient =
                sportColors[sportKey] || "from-indigo-500 to-purple-600";

              // Sport emoji map
              const sportEmojis: Record<string, string> = {
                football: "⚽",
                cricket: "🏏",
                chess: "♟️",
                badminton: "🏸",
                tennis: "🎾",
                kabaddi: "🤼",
                basketball: "🏀",
                volleyball: "🏐",
                "table tennis": "🏓",
                athletics: "🏃",
                "kho-kho": "🏅",
              };
              const sportEmoji = sportEmojis[sportKey] || "🏆";

              return (
                <div
                  key={t._id}
                  className={`group relative rounded-3xl overflow-hidden bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-xl transition-all duration-500 flex flex-col ${
                    isInactive
                      ? "opacity-90 grayscale-[20%]"
                      : "hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-300/50 dark:hover:border-indigo-500/50 cursor-pointer"
                  }`}
                >
                  {/* ── COLORED HEADER STRIP ─────────────────────── */}
                  <div
                    className={`relative bg-gradient-to-br ${
                      isInactive ? "from-gray-400 to-gray-500" : headerGradient
                    } px-6 pt-5 pb-12 overflow-hidden`}
                  >
                    {/* Decorative pattern overlay */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "16px 16px" }}></div>
                    {/* Sport name + emoji */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{sportEmoji}</span>
                      <h2 className="text-white font-extrabold text-lg leading-tight drop-shadow">
                        {t.sport} Tournament
                      </h2>
                    </div>

                    {/* Location chip */}
                    <div className="flex items-center gap-1 mt-1 text-white/80 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{t.city}, {t.state}</span>
                    </div>

                    {/* Prize badge — top right corner */}
                    {t.prizePool && t.prizePool > 0 && (
                      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                        🏆 ₹{t.prizePool.toLocaleString()}
                      </div>
                    )}

                    {/* Bottom curved gradient shade */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none rounded-t-[100%]" style={{ transform: "scaleX(1.5)", transformOrigin: "bottom center" }} />
                  </div>

                  {/* ── STATUS BANNER (replaces ribbon) ─────────────── */}
                  {isInactive && (
                    <div
                      className={`relative z-20 -mt-1 w-full flex items-center justify-center gap-2 py-2 px-4 text-white text-sm font-bold tracking-wide bg-gradient-to-r ${status.ribbonBg} shadow-md`}
                    >
                      <span className="text-base">{status.emoji}</span>
                      <span>{status.label}</span>
                    </div>
                  )}

                  {/* ── CARD BODY ────────────────────────────────────── */}
                  <div className="px-6 pt-1 pb-6 space-y-4 flex-1 flex flex-col relative z-10">

                    {/* Open badge for active */}
                    {status.isActive && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${status.tagBg} ${status.tagText} uppercase tracking-wider`}>
                        {status.emoji} {status.label}
                      </span>
                    )}

                    {/* Organizer */}
                    {t.organizer && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">
                          {t.organizer.organizationName || t.organizer.name}
                        </span>
                      </div>
                    )}

                    {/* Dates row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Starts: {new Date(t.startDate).toLocaleDateString("en-GB")}</span>
                      </div>
                      {t.registrationDeadline && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${isInactive ? "text-red-500 dark:text-red-400" : "text-orange-600 dark:text-orange-400"}`}>
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Deadline: {new Date(t.registrationDeadline).toLocaleDateString("en-GB")}</span>
                        </div>
                      )}
                    </div>

                    {/* Entry fee */}
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      t.entryFee === 0
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                        : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50"
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.entryFee === 0 ? "🎁 Free Entry" : `Entry: ₹${t.entryFee}`}
                    </div>

                    <div className="flex-1"></div> {/* Spacer to push buttons to bottom */}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                    {/* CTA Button */}
                    <div className="pt-2">
                      <Link
                        href={`/tournaments/${t._id}`}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {tournaments.length === 0 && (
              <div className="md:col-span-3 sm:col-span-2 text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                  No tournaments found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try adjusting your filters or check back later
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

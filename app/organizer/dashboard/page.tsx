"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { MapPin, CalendarDays, Users, IndianRupee, Trophy, Search, Filter, ArrowUpDown, X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import DashboardNavbar from "@/components/DashboardNavbar";
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
  const { user, logout } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"sponsorships" | "tournaments">(
    "tournaments",
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc");

  const hasFilters = searchQuery !== "" || statusFilter !== "all" || sortBy !== "dateDesc";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("dateDesc");
  };

  const filteredAndSortedTournaments = tournaments
    .filter((t) => {
      const matchesSearch =
        t.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "dateDesc")
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (sortBy === "dateAsc")
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (sortBy === "name") return (a.name || a.sport).localeCompare(b.name || b.sport);
      return 0;
    });

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, sRes] = await Promise.all([
          fetch("/api/organizer/tournaments", { credentials: "include" }),
          fetch("/api/organizer/sponsorships", { credentials: "include" }),
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
  }, []);

  if (!user || user.role !== "organizer") {
    return <div className="p-6">Access denied.</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors flex flex-col">
      {/* Base Background Layer */}
      <div className="absolute inset-0 pointer-events-none -z-20 bg-linear-to-br from-indigo-50/40 via-white to-purple-50/40 dark:bg-none dark:bg-[#040812]" />
      
      {/* Soft Ambience Background - Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 dark:bg-indigo-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-[130px] mix-blend-multiply dark:mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 dark:bg-purple-500/15 blur-[100px] mix-blend-multiply dark:mix-blend-screen" 
        />
      </div>

      <DashboardNavbar
        title="Organizer Dashboard"
        userName={user?.name || "User"}
        userProfileComplete={Boolean(user?.city && user?.state && user?.gender)}
        userPhoneVerified={Boolean(user?.phoneVerified)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={logout}
        userGender={user?.gender}
        notificationCount={sponsorships.filter(s => s.status === 'pending').length}
        stats={[
          { label: "Tournaments", value: tournaments.length },
          { label: "Pending Sponsors", value: sponsorships.filter(s => s.status === 'pending').length }
        ]}
      />
      <div className="pt-20 sm:pt-24 p-3 sm:p-6 max-w-6xl mx-auto w-full relative z-10">
        <Link
          href="/organizer/tournaments/new"
          className="inline-flex items-center gap-2 mb-6 bg-linear-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Organise a Tournament
        </Link>
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />

        {/* Navigation Bar - Segmented Control */}
        <div className="mb-8 flex">
          <div className="bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-300/30 dark:border-gray-700/30 rounded-lg p-1 inline-flex shadow-inner">
            <button
              onClick={() => setActiveTab("tournaments")}
              className={`relative flex items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-md font-semibold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === "tournaments"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
            >
              Your Tournaments
              {tournaments.length > 0 && (
                <span className={`ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full ${
                  activeTab === "tournaments" ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : "bg-gray-300/50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400"
                }`}>
                  {tournaments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("sponsorships")}
              className={`relative flex items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-md font-semibold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === "sponsorships"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              }`}
            >
              Sponsorship Requests
              {sponsorships.length > 0 && (
                <span className={`ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full ${
                  activeTab === "sponsorships" ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300" : "bg-gray-300/50 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400"
                }`}>
                  {sponsorships.length}
                </span>
              )}
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
            {activeTab === "sponsorships" && sponsorships.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                  Sponsorship Requests
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sponsorships.map((s) => (
                    <div
                      key={s._id}
                      className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:border-indigo-300/50 dark:hover:border-indigo-500/50 transition-all duration-500 flex flex-col h-full overflow-hidden"
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
                        <div className="flex gap-2 mt-auto pt-4">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `/api/organizer/sponsorships`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    credentials: "include",
                                    body: JSON.stringify({
                                      sponsorshipId: s._id,
                                      status: "approved",
                                    }),
                                  },
                                );
                                const data = await res.json();
                                if (!res.ok)
                                  throw new Error(
                                    data.error || "Failed to approve",
                                  );
                                setSponsorships((prev) =>
                                  prev.map((sp) =>
                                    sp._id === s._id
                                      ? { ...sp, status: "approved" }
                                      : sp,
                                  ),
                                );
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md"
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `/api/organizer/sponsorships`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    credentials: "include",
                                    body: JSON.stringify({
                                      sponsorshipId: s._id,
                                      status: "rejected",
                                    }),
                                  },
                                );
                                const data = await res.json();
                                if (!res.ok)
                                  throw new Error(
                                    data.error || "Failed to reject",
                                  );
                                setSponsorships((prev) =>
                                  prev.map((sp) =>
                                    sp._id === s._id
                                      ? { ...sp, status: "rejected" }
                                      : sp,
                                  ),
                                );
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md"
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 transition-colors">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white shrink-0">
                    Your Tournaments
                  </h2>
                  
                  {/* Filters & Search */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search tournaments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white shadow-sm"
                      />
                    </div>
                    
                    {/* Status Filter */}
                    <div className="relative w-full sm:w-auto">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-36 appearance-none pl-4 pr-10 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-gray-700 dark:text-gray-300 shadow-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Active</option>
                        <option value="closed">Closed</option>
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative w-full sm:w-auto">
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-40 appearance-none pl-4 pr-10 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer text-gray-700 dark:text-gray-300 shadow-sm"
                      >
                        <option value="dateDesc">Newest First</option>
                        <option value="dateAsc">Oldest First</option>
                        <option value="name">Name (A-Z)</option>
                      </select>
                      <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Clear Filters Button */}
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors border border-red-100 dark:border-red-800/30 w-full sm:w-auto shrink-0"
                        title="Clear all filters"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {filteredAndSortedTournaments.length === 0 && (
                  <div className="text-center py-16 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No tournaments match your search criteria.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAndSortedTournaments.map((t) => (
                    <div
                      key={t._id}
                      className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:border-indigo-300/50 dark:hover:border-indigo-500/50 transition-all duration-500 flex flex-col h-full overflow-hidden"
                    >
                      {/* TOP & SECONDARY INFO */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">
                            {t.sport} Tournament
                          </h2>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin className="w-4 h-4 text-indigo-500" />
                              {t.city}, {t.state}
                            </span>
                            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                            <span className="flex items-center gap-1.5 font-medium">
                              <CalendarDays className="w-4 h-4 text-emerald-500" />
                              {new Date(t.startDate).toLocaleDateString("en-GB")}
                            </span>
                            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-bold border uppercase tracking-wide ${
                                t.status === "open"
                                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50"
                                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50"
                              }`}
                            >
                              {t.status === "open" ? "Open" : "Closed"}
                            </span>
                          </div>
                        </div>
                        {t.prizePool && (
                          <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 shadow-sm">
                            <Trophy className="w-3.5 h-3.5" /> ₹{t.prizePool}
                          </span>
                        )}
                      </div>

                      {/* METADATA GRID */}
                      <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 my-auto border border-gray-100 dark:border-gray-700/50">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Entry Fee</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-0.5">
                              <IndianRupee className="w-3.5 h-3.5 text-indigo-500" />
                              {t.entryFee === 0 ? "Free" : t.entryFee}
                            </span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Players</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-indigo-500" />
                              {t.currentParticipants}/{t.maxParticipants}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Age Group</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {t.ageGroup || "Open"}
                            </span>
                          </div>
                        </div>
                        
                        {(t.allowTeamRegistration && t.teamSize) || t.venue ? (
                          <>
                            <div className="h-px w-full bg-gray-200 dark:bg-gray-700/50 my-3" />
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                              {t.venue && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Venue:</span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]" title={t.venue}>{t.venue}</span>
                                </div>
                              )}
                              {t.allowTeamRegistration && t.teamSize && (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Team Size:</span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{t.teamSize} Players</span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : null}
                      </div>
                      <div className="mt-auto pt-4 flex items-center gap-2">
                        <Link
                          href={`/organizer/tournaments/${t._id}/registrations`}
                          className="flex-2 text-center bg-linear-to-r from-indigo-500 to-purple-600 text-white px-3 py-2.5 rounded-xl text-sm font-bold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                          View Players
                        </Link>
                        <Link
                          href={`/organizer/tournaments/new?editId=${t._id}`}
                          className="flex-1 text-center bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-white dark:hover:bg-gray-700 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                        >
                          Edit
                        </Link>
                        
                        <div className="relative group/kebab">
                          <button
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors hover:shadow-sm"
                            aria-label="Options"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                          </button>
                          
                          <div className="absolute right-0 bottom-full mb-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover/kebab:opacity-100 group-hover/kebab:visible transition-all duration-200 z-10 overflow-hidden transform translate-y-2 group-hover/kebab:translate-y-0">
                            <button
                               onClick={async () => {
                                 if (!confirm(`Are you sure you want to delete ${t.sport} Tournament? This action cannot be undone.`)) return;
                                 setDeletingId(t._id);
                                 try {
                                   const res = await fetch(`/api/tournaments/${t._id}`, { method: "DELETE", credentials: "include" });
                                   const data = await res.json();
                                   if (!res.ok) throw new Error(data.error || "Failed to delete tournament");
                                   setTournaments((prev) => prev.filter((tournament) => tournament._id !== t._id));
                                   alert("Tournament deleted successfully!");
                                 } catch (e: any) {
                                   alert(e.message);
                                 } finally {
                                   setDeletingId(null);
                                 }
                               }}
                               disabled={deletingId === t._id}
                               className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                             >
                               {deletingId === t._id ? (
                                 "Deleting..."
                               ) : (
                                 <>
                                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  Delete
                                 </>
                               )}
                             </button>
                          </div>
                        </div>
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

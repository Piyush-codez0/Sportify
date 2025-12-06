"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";

interface Registration {
  _id: string;
  registrationType: string;
  status: string;
  paymentStatus: string;
  verified: boolean;
  teamName?: string;
  player: { name: string; email: string; phone: string };
  teamMembers?: Array<{
    name: string;
    email: string;
    phone: string;
    aadharNumber: string;
    aadharDocument: string;
    aadharFrontDocument?: string;
    aadharBackDocument?: string;
  }>;
  aadharNumber?: string;
  aadharDocument?: string;
  aadharBackDocument?: string;
  registrationDate?: string;
}

export default function TournamentRegistrations() {
  const { user, token } = useAuth();
  const params = useParams();
  const tournamentId = params?.id as string;
  const [tournamentTitle, setTournamentTitle] = useState(
    "Tournament Player Registrations"
  );
  const [sport, setSport] = useState<string>("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [filter, setFilter] = useState<
    "all" | "verified" | "pending" | "rejected"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [undoStates, setUndoStates] = useState<Set<string>>(new Set());
  const [actionType, setActionType] = useState<"success" | "error" | "info">(
    "info"
  );

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/organizer/registrations/${tournamentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setRegistrations(data.registrations);
        if (data.sport) setSport(data.sport);
        if (data.tournamentName) {
          setTournamentTitle(`${data.tournamentName} Player Registrations`);
        } else if (tournamentId) {
          setTournamentTitle(
            `${decodeURIComponent(
              tournamentId
            )} Tournament Player Registrations`
          );
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (tournamentId) load();
  }, [token, tournamentId]);

  const verify = async (registrationId: string, verified: boolean) => {
    setActionMessage("Processing...");
    setActionType("info");
    try {
      const res = await fetch("/api/organizer/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registrationId, verified }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const apiStatus = data.registration?.status;
      const apiVerified = data.registration?.verified;
      const resolvedStatus = apiStatus ?? (verified ? "confirmed" : "rejected");
      const resolvedVerified =
        typeof apiVerified === "boolean" ? apiVerified : verified;
      setRegistrations((prev) =>
        prev.map((r) =>
          r._id === registrationId
            ? {
                ...r,
                verified: resolvedVerified,
                status: resolvedStatus,
              }
            : r
        )
      );
      // Remove from undo states when action is taken
      setUndoStates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(registrationId);
        return newSet;
      });
      setActionType("success");
      setActionMessage(
        verified ? "Approved successfully" : "Rejected successfully"
      );
      setTimeout(() => setActionMessage(""), 3000);
    } catch (e: any) {
      setActionType("error");
      setActionMessage(e.message);
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const undoAction = async (registrationId: string) => {
    setActionMessage("Resetting...");
    setActionType("info");
    try {
      const res = await fetch("/api/organizer/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registrationId, reset: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      setRegistrations((prev) => {
        let found = false;
        const updated = prev.map((r) => {
          if (r._id === registrationId) {
            found = true;
            return {
              ...r,
              ...data.registration,
              player:
                data.registration?.player &&
                typeof data.registration.player === "object"
                  ? data.registration.player
                  : r.player,
              teamMembers: data.registration?.teamMembers?.length
                ? data.registration.teamMembers
                : r.teamMembers,
            };
          }
          return r;
        });
        return found
          ? updated
          : [
              {
                ...data.registration,
                player:
                  data.registration?.player &&
                  typeof data.registration.player === "object"
                    ? data.registration.player
                    : undefined,
              },
              ...prev,
            ];
      });

      // Ensure card stays visible after reset by switching to All filter
      setFilter("all");

      setUndoStates((prev) => new Set(prev).add(registrationId));
      setActionType("info");
      setActionMessage("Back to pending. Review and approve or reject.");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (e: any) {
      setActionType("error");
      setActionMessage(e.message || "Reset failed");
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  // Filter and sort registrations
  const filteredRegistrations = registrations
    .filter((r) => {
      if (filter === "verified") return r.verified;
      if (filter === "pending") return !r.verified && r.status !== "rejected";
      if (filter === "rejected") return r.status === "rejected";
      return true;
    })
    .filter((r) => {
      const name = r.registrationType === "team" ? r.teamName : r.player.name;
      return name?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        const nameA =
          a.registrationType === "team" ? a.teamName : a.player.name;
        const nameB =
          b.registrationType === "team" ? b.teamName : b.player.name;
        return (nameA || "").localeCompare(nameB || "");
      }
      if (sortBy === "status") {
        const statusOrder = { rejected: 0, pending: 1, confirmed: 2 };
        return (
          (statusOrder[a.status as keyof typeof statusOrder] || 0) -
          (statusOrder[b.status as keyof typeof statusOrder] || 0)
        );
      }
      return (
        new Date(b.registrationDate || 0).getTime() -
        new Date(a.registrationDate || 0).getTime()
      );
    });

  // Calculate statistics
  const stats = {
    total: registrations.length,
    verified: registrations.filter((r) => r.verified).length,
    pending: registrations.filter((r) => !r.verified && r.status !== "rejected")
      .length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
    paid: registrations.filter((r) => r.paymentStatus === "paid").length,
    teams: registrations.filter((r) => r.registrationType === "team").length,
  };

  if (!user || user.role !== "organizer")
    return (
      <div className="p-6 text-red-600 text-center font-semibold">
        Access denied. Only organizers can view registrations.
      </div>
    );

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <SportsDoodlesBackground />

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/icon.png"
              alt="Sportify"
              className="w-10 h-10 rounded-xl shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {sport} <span>Tournament Player Registrations</span>
              </h1>
              
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Manage and verify participant registrations for this tournament
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-start gap-3 transition-colors">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Error loading registrations</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Floating Action Bubble */}
        {actionMessage && (
          <button
            onClick={() => setActionMessage("")}
            className="fixed inset-x-0 bottom-6 flex justify-center z-50 animate-bounce-in focus:outline-none"
            aria-label="Close notification"
          >
            <div
              className={`relative px-5 py-3 rounded-full shadow-2xl border text-sm font-semibold flex items-center gap-2 transition-transform hover:translate-y-[-2px] active:translate-y-[1px]
              ${
                actionType === "success"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-teal-300/60"
                  : actionType === "error"
                  ? "bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-300/60"
                  : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-indigo-300/60"
              }
            `}
            >
              <span className="text-base">
                {actionType === "success"
                  ? "✓"
                  : actionType === "error"
                  ? "✕"
                  : "ℹ️"}
              </span>
              <span>{actionMessage}</span>
              <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center hover:bg-white/30">
                ×
              </span>
            </div>
          </button>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Payments Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Paid
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.paid}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Teams
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.teams}
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by name or team name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>

              <div className="flex gap-2 flex-wrap">
                {(["all", "verified", "pending", "rejected"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                        filter === f
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {f === "all" ? "All" : f}
                      {f === "all" && ` (${stats.total})`}
                      {f === "verified" && ` (${stats.verified})`}
                      {f === "pending" && ` (${stats.pending})`}
                      {f === "rejected" && ` (${stats.rejected})`}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Registrations Grid */}
            {filteredRegistrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRegistrations.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Compact Registration Header */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                            r.registrationType === "team"
                              ? "bg-blue-600"
                              : "bg-purple-600"
                          }`}
                        >
                          {r.registrationType === "team" ? "👥" : "👤"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {r.registrationType === "team"
                              ? r.teamName
                              : r.player.name}
                          </h3>
                          {r.registrationType === "individual" && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              📧 {r.player.email} | 📱 {r.player.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                        {r.paymentStatus === "paid" && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            💰 Paid
                          </span>
                        )}
                        {r.status === "confirmed" && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            Confirmed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compact Details */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                      {r.aadharNumber && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-indigo-600 dark:text-indigo-400">
                              🪪
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              Aadhar No: {r.aadharNumber}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {r.aadharDocument && (
                              <a
                                href={r.aadharDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 rounded-md text-center text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                              >
                                📄 View Front Side
                              </a>
                            )}
                            {r.aadharBackDocument && (
                              <a
                                href={r.aadharBackDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 rounded-md text-center text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                              >
                                📄 View Back Side
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Team Members (if team registration) */}
                      {r.registrationType === "team" &&
                        r.teamMembers &&
                        r.teamMembers.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="font-semibold text-gray-900 dark:text-white text-xs">
                              Team ({r.teamMembers.length})
                            </p>
                            {r.teamMembers.map((m, i) => (
                              <div
                                key={i}
                                className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {m.name}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 truncate">
                                      {m.email} | {m.phone}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      Aadhar No: {m.aadharNumber}
                                    </p>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    {(m.aadharFrontDocument ||
                                      m.aadharDocument) && (
                                      <a
                                        href={
                                          m.aadharFrontDocument ||
                                          m.aadharDocument
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                        title="View Front Side"
                                      >
                                        📄F
                                      </a>
                                    )}
                                    {m.aadharBackDocument && (
                                      <a
                                        href={m.aadharBackDocument}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                        title="View Back Side"
                                      >
                                        📄B
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Action Buttons with Undo */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {(!r.verified && r.status !== "rejected") ||
                      undoStates.has(r._id) ? (
                        <>
                          <button
                            onClick={() => verify(r._id, true)}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => verify(r._id, false)}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-between gap-2">
                          <span
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                              r.verified
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {r.verified ? "✓ Approved" : "✗ Rejected"}
                          </span>
                          <button
                            onClick={() => undoAction(r._id)}
                            className="px-3 py-1.5 text-sm rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            ↺ Reset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {registrations.length === 0
                    ? "No registrations yet"
                    : "No registrations match your filters"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

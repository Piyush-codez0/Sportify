"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import { INDIAN_STATES } from "@/lib/indianStates";
import { INDIAN_DISTRICTS } from "@/lib/indianDistricts";

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  city: string;
  state: string;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  googleMapsLink?: string;
  startDate: string;
  entryFee: number;
  prizePool?: number;
  organizer?: {
    _id: string;
    name: string;
    organizationName?: string;
  };
}

export default function TournamentsBrowse() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    district: "",
    state: "",
    sport: "",
    useRadius: false,
    radiusKm: "10",
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
      setTournaments(data.tournaments);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 relative transition-colors">
      <SportsDoodlesBackground />
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <img
            src="/icon.png"
            alt="Sportify"
            className="w-12 h-12 rounded-xl shadow-lg"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Browse Tournaments
          </h1>
        </div>

        {/* Location Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <select
            value={filters.state}
            onChange={(e) => {
              setFilters({ ...filters, state: e.target.value, district: "" });
            }}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded transition-colors"
            disabled={filters.useRadius}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <select
            value={filters.district}
            onChange={(e) =>
              setFilters({ ...filters, district: e.target.value })
            }
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded transition-colors"
            disabled={!filters.state || filters.useRadius}
          >
            <option value="">Select District</option>
            {filters.state &&
              INDIAN_DISTRICTS[filters.state]?.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
          </select>
          <input
            placeholder="Sport"
            value={filters.sport}
            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded transition-colors"
          />
        </div>

        {/* Near Me Section - Highlighted */}
        <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg transition-colors">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.useRadius}
                    onChange={(e) => {
                      setFilters({ ...filters, useRadius: e.target.checked });
                      if (e.target.checked && !location) getLocation();
                    }}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                    🎯 Find Tournaments Near Me
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-7">
                  Use your current location to find nearby tournaments
                </p>
              </div>
            </div>
            {filters.useRadius && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Radius:
                </label>
                <input
                  type="number"
                  placeholder="km"
                  value={filters.radiusKm}
                  onChange={(e) =>
                    setFilters({ ...filters, radiusKm: e.target.value })
                  }
                  className="w-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded transition-colors"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  km
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setFilters({
                district: "",
                state: "",
                sport: "",
                useRadius: false,
                radiusKm: "10",
              });
              setLocation(null);
            }}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
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
          <div className="grid md:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <div
                key={t._id}
                className="group relative border-2 border-purple-200/50 dark:border-purple-500/30 p-6 rounded-2xl bg-gradient-to-br from-white via-purple-50/40 to-blue-50/50 dark:from-gray-800 dark:via-purple-900/20 dark:to-blue-900/20 shadow-md hover:shadow-2xl hover:scale-[1.03] hover:border-purple-400/60 dark:hover:border-purple-400/50 transition-all duration-400 ease-out overflow-hidden cursor-pointer backdrop-blur-sm"
              >
                {/* Soft purple gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/0 via-blue-100/0 to-pink-100/0 group-hover:from-purple-100/30 group-hover:via-blue-100/20 group-hover:to-pink-100/20 dark:group-hover:from-purple-900/15 dark:group-hover:via-blue-900/10 dark:group-hover:to-pink-900/15 transition-all duration-500 rounded-2xl" />

                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-70 dark:group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-purple-200/40 via-blue-200/30 to-pink-200/30 dark:from-purple-500/20 dark:via-blue-500/15 dark:to-pink-500/20 blur-2xl -z-10" />

                {t.prizePool && t.prizePool > 0 && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 z-10">
                    🏆 ₹{t.prizePool.toLocaleString()}
                  </div>
                )}

                <div className="relative z-10">
                  <h2 className="font-bold text-xl text-gray-800 dark:text-white transition-colors pr-24 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-300">
                    {t.sport} Tournament
                  </h2>

                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>
                      {t.city}, {t.state}
                    </span>
                  </div>

                  {t.organizer && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        Organizer:{" "}
                        {t.organizer.organizationName || t.organizer.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      Starts:{" "}
                      {new Date(t.startDate).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  {t.entryFee > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">
                        Entry Fee: ₹{t.entryFee}
                      </span>
                    </div>
                  )}

                  {/* Divider line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mb-4 group-hover:via-purple-300 transition-colors duration-300" />

                  <div className="flex items-center">
                    <Link
                      href={`/tournaments/${t._id}#register`}
                      className="w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold py-2.5 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-purple-400/20 hover:shadow-purple-500/30"
                    >
                      ⚡ Join Now
                    </Link>
                  </div>

                  {t.location?.coordinates && (
                    <div className="mt-3">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${t.location.coordinates[1]},${t.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-green-400/20 hover:shadow-green-500/30"
                      >
                        📍 Show Location
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {tournaments.length === 0 && (
              <div className="text-gray-600 dark:text-gray-400 transition-colors">
                No tournaments found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

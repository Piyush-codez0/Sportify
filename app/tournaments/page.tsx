"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  city: string;
  state: string;
  googleMapsLink?: string;
  startDate: string;
  entryFee: number;
}

export default function TournamentsBrowse() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    city: "",
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
      if (filters.city) params.set("city", filters.city);
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
    fetchTournaments();
  }, []);

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

  useEffect(() => {
    if (filters.useRadius && location) fetchTournaments();
  }, [filters.useRadius, location, filters.radiusKm]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Browse Tournaments</h1>
      <div className="grid md:grid-cols-5 gap-4 mb-4">
        <input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="State"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Sport"
          value={filters.sport}
          onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
          className="border p-2 rounded"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.useRadius}
            onChange={(e) => {
              setFilters({ ...filters, useRadius: e.target.checked });
              if (e.target.checked && !location) getLocation();
            }}
          />
          <label className="text-sm">Near Me</label>
        </div>
        {filters.useRadius && (
          <input
            placeholder="Radius km"
            value={filters.radiusKm}
            onChange={(e) =>
              setFilters({ ...filters, radiusKm: e.target.value })
            }
            className="border p-2 rounded"
          />
        )}
      </div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={fetchTournaments}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Search
        </button>
        <button
          onClick={() => {
            setFilters({
              city: "",
              state: "",
              sport: "",
              useRadius: false,
              radiusKm: "10",
            });
            setLocation(null);
            fetchTournaments();
          }}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div key={t._id} className="border p-4 rounded bg-white shadow">
              <h2 className="font-semibold">{t.name}</h2>
              <p className="text-sm text-gray-600">
                {t.sport} • {t.city}, {t.state}
              </p>
              <p className="text-xs mt-1">
                Starts: {new Date(t.startDate).toLocaleDateString("en-GB")}
              </p>
              {t.entryFee > 0 && (
                <p className="text-xs mt-1">Entry Fee: ₹{t.entryFee}</p>
              )}
              <div className="mt-3 flex gap-3 items-center">
                <Link
                  href={`/tournaments/${t._id}`}
                  className="text-indigo-600 text-sm hover:underline"
                >
                  Details
                </Link>
                <Link
                  href={`/tournaments/${t._id}#register`}
                  className="inline-block bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Participate
                </Link>
                {t.googleMapsLink && (
                  <a
                    href={t.googleMapsLink}
                    target="_blank"
                    className="text-sm text-green-600 hover:underline"
                  >
                    Map
                  </a>
                )}
              </div>
            </div>
          ))}
          {tournaments.length === 0 && (
            <div className="text-gray-600">No tournaments found.</div>
          )}
        </div>
      )}
    </div>
  );
}

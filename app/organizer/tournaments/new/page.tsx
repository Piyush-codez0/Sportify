"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import { INDIAN_STATES } from "@/lib/indianStates";

declare global {
  interface Window {
    google: any;
  }
}

export default function NewTournamentPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<any>({
    name: "",
    sport: "",
    description: "",
    venue: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    registrationStartDate: "",
    registrationDeadline: "",
    tournamentStartDate: "",
    maxParticipants: "",
    allowTeamRegistration: false,
    teamSize: "",
    entryFee: "",
    prizePool: "",
    rules: "",
    ageGroup: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && document.getElementById("map")) {
      initMap();
    }
  }, [mapLoaded]);

  const initMap = () => {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 28.6139, lng: 77.209 }, // Default: New Delhi
      zoom: 12,
    });

    const marker = new window.google.maps.Marker({
      map: map,
      draggable: true,
    });

    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById("location-search") as HTMLInputElement
    );

    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds() as any);
    });

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      map.setCenter(place.geometry.location);
      marker.setPosition(place.geometry.location);

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setForm((prev: any) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }));

      setSelectedLocation(place.formatted_address || "");
    });

    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      if (position) {
        setForm((prev: any) => ({
          ...prev,
          latitude: position.lat().toString(),
          longitude: position.lng().toString(),
        }));

        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: position },
          (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              setSelectedLocation(results[0].formatted_address);
            }
          }
        );
      }
    });

    map.addListener("click", (e: any) => {
      marker.setPosition(e.latLng);
      setForm((prev: any) => ({
        ...prev,
        latitude: e.latLng.lat().toString(),
        longitude: e.latLng.lng().toString(),
      }));

      // Reverse geocode
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          setSelectedLocation(results[0].formatted_address);
        }
      });
    });
  };

  if (!user || user.role !== "organizer")
    return <div className="p-6">Access denied.</div>;

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          startDate: form.tournamentStartDate,
          endDate: form.tournamentStartDate, // Same as start for single-day tournaments
          registrationDeadline: form.registrationDeadline,
          maxParticipants: parseInt(form.maxParticipants, 10),
          teamSize: form.teamSize ? parseInt(form.teamSize, 10) : undefined,
          entryFee: parseFloat(form.entryFee || "0"),
          prizePool: form.prizePool ? parseFloat(form.prizePool) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/organizer/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 transition-colors relative">
      <SportsDoodlesBackground />
      <div className="max-w-3xl mx-auto p-6 relative z-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
          Organise a Tournament
        </h1>
        <h4 className="text-sm text-red-600 dark:text-red-400 mb-4 transition-colors">
          Enter Tournament details...
        </h4>
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded border border-red-200 dark:border-red-800 transition-colors">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            <input
              name="sport"
              placeholder="Sport"
              value={form.sport}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            <input
              name="venue"
              placeholder="Venue"
              value={form.venue}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              required
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Google Maps Location Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
              Tournament Location
            </label>
            <input
              id="location-search"
              type="text"
              placeholder="Search for a location..."
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
            <div
              id="map"
              className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded transition-colors"
              style={{ minHeight: "400px" }}
            ></div>
            {selectedLocation && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 transition-colors">
                Selected: {selectedLocation}
              </p>
            )}
            {form.latitude && form.longitude && (
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                Coordinates: {form.latitude}, {form.longitude}
              </p>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                Registration Start Date
              </label>
              <input
                type="date"
                name="registrationStartDate"
                value={form.registrationStartDate}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                Registration Deadline
              </label>
              <input
                type="date"
                name="registrationDeadline"
                value={form.registrationDeadline}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                Tournament Start Date
              </label>
              <input
                type="date"
                name="tournamentStartDate"
                value={form.tournamentStartDate}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="maxParticipants"
              placeholder="Max Participants"
              value={form.maxParticipants}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
              required
            />
            <input
              name="entryFee"
              placeholder="Entry Fee (INR)"
              value={form.entryFee}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
          </div>
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            required
          />
          <textarea
            name="rules"
            placeholder="Rules"
            value={form.rules}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="ageGroup"
              placeholder="Age Group (e.g. U19)"
              value={form.ageGroup}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
            <input
              name="prizePool"
              placeholder="Prize Pool (INR)"
              value={form.prizePool}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
            <input
              name="contactEmail"
              placeholder="Contact Email"
              value={form.contactEmail}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
            <input
              name="contactPhone"
              placeholder="Contact Phone"
              value={form.contactPhone}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowTeamRegistration"
              checked={form.allowTeamRegistration}
              onChange={handleChange}
              id="teamReg"
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <label
              htmlFor="teamReg"
              className="text-gray-900 dark:text-white transition-colors"
            >
              Allow Team Registration
            </label>
          </div>
          {form.allowTeamRegistration && (
            <input
              name="teamSize"
              placeholder="Team Size"
              value={form.teamSize}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
          )}
          <button
            disabled={loading}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-400 dark:disabled:bg-indigo-700 transition-colors"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </form>
      </div>
    </div>
  );
}

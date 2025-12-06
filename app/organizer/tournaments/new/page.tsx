"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import LocationPicker from "@/components/LocationPicker";
import { INDIAN_STATES } from "@/lib/indianStates";

export default function NewTournamentPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Check if organizer is verified
  const isProfileComplete = user?.city && user?.state && user?.gender;
  const isPhoneVerified = user?.phoneVerified;
  const isVerified = isProfileComplete && isPhoneVerified;

  const [form, setForm] = useState<any>({
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
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setForm((prev: any) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    if (address) {
      setSelectedLocation(address);
    }
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
      if (!user?.name) {
        throw new Error("Account name not found. Please re-login.");
      }

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          name: user.name,
          contactEmail: user.email,
          contactPhone: user.phone,
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

  // Show verification warning if not verified
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 transition-colors relative">
        <SportsDoodlesBackground />
        <div className="max-w-3xl mx-auto p-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/icon.png"
              alt="Sportify"
              className="w-12 h-12 rounded-xl shadow-lg"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              Organise a Tournament
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="text-center">
              <svg
                className="w-20 h-20 text-yellow-500 dark:text-yellow-400 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Verification Required
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You must complete your profile and verify your phone number
                before organizing tournaments.
              </p>

              <div className="space-y-3 mb-6">
                <div
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    isProfileComplete
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                      : "bg-red-50 dark:bg-red-900/20 border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isProfileComplete ? (
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Complete Profile
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isProfileComplete
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isProfileComplete ? "Completed" : "Incomplete"}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    isPhoneVerified
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                      : "bg-red-50 dark:bg-red-900/20 border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isPhoneVerified ? (
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Phone Verification
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isPhoneVerified
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPhoneVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/organizer/dashboard")}
                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Go to Dashboard to Complete Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 transition-colors relative">
      <SportsDoodlesBackground />
      <div className="max-w-3xl mx-auto p-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/icon.png"
            alt="Sportify"
            className="w-12 h-12 rounded-xl shadow-lg"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Organise a Tournament
          </h1>
        </div>
        <h4 className="text-sm text-red-600 dark:text-red-400 mb-4 transition-colors">
          Enter Tournament details...
        </h4>
        <div className="mb-4 flex items-center gap-3 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Organizer
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {user?.name || "Unknown"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded border border-red-200 dark:border-red-800 transition-colors">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

          {/* Leaflet Location Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
              Tournament Location
            </label>
            <LocationPicker
              initialLat={30.3165}
              initialLng={78.0322}
              onLocationChange={handleLocationChange}
              height="400px"
            />
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
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                Max Participants
              </label>
              <input
                name="maxParticipants"
                placeholder="Max Participants"
                value={form.maxParticipants}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                required
              />
            </div>
          </div>
          <input
            name="entryFee"
            placeholder="Entry Fee (INR)"
            value={form.entryFee}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
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
            <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
              Contact details will use your account email/phone.
            </div>
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

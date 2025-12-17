"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import LocationPicker from "@/components/LocationPicker";
import { INDIAN_STATES } from "@/lib/indianStates";
import Stepper, { Step } from "@/components/Stepper";

const POPULAR_SPORTS = [
  "Cricket",
  "Football",
  "Chess",
  "Badminton",
  "Tennis",
  "Kabaddi",
  "Basketball",
  "Volleyball",
  "Table Tennis",
  "Athletics",
];

export default function NewTournamentPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Check if organizer is verified
  const isProfileComplete = user?.city && user?.state && user?.gender;
  const isPhoneVerified = user?.phoneVerified;
  const isVerified = isProfileComplete && isPhoneVerified;

  const [form, setForm] = useState<any>({
    sport: "",
    sportOther: "",
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
    entryFee: "",
    prizePool: "",
    rules: "",
    ageGroup: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [stepError, setStepError] = useState<string>("");

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    setStepError("");
    if (!form.sport) {
      setStepError("Please select a sport");
      return false;
    }
    if (form.sport === "Other" && !form.sportOther.trim()) {
      setStepError("Please enter the sport name");
      return false;
    }
    if (!form.venue.trim()) {
      setStepError("Please enter the venue");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setStepError("");
    if (!form.latitude || !form.longitude) {
      setStepError("Please select a location on the map");
      return false;
    }
    if (!form.city) {
      setStepError(
        "City could not be detected from location. Please try a different location."
      );
      return false;
    }
    if (!form.state) {
      setStepError(
        "State could not be detected from location. Please try a different location."
      );
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setStepError("");
    if (!form.registrationStartDate) {
      setStepError("Please enter registration start date");
      return false;
    }
    if (!form.registrationDeadline) {
      setStepError("Please enter registration deadline");
      return false;
    }
    if (!form.tournamentStartDate) {
      setStepError("Please enter tournament start date");
      return false;
    }
    if (!form.maxParticipants) {
      setStepError("Please enter max participants");
      return false;
    }
    if (parseInt(form.maxParticipants) < 2) {
      setStepError("Max participants must be at least 2");
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    setStepError("");
    // All fields in step 4 are optional, so validation passes
    return true;
  };

  const validateStep5 = (): boolean => {
    setStepError("");
    return true;
  };

  const handleStepChange = (step: number): boolean => {
    if (step === 2) return validateStep1();
    if (step === 3) return validateStep2();
    if (step === 4) return validateStep3();
    if (step === 5) return validateStep4();
    return true;
  };

  const handleLocationChange = async (
    lat: number,
    lng: number,
    address?: string
  ) => {
    setForm((prev: any) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    if (address) {
      setSelectedLocation(address);
    }

    // Extract city and state from coordinates using reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.address) {
        const city =
          data.address.city || data.address.town || data.address.village || "";
        const state = data.address.state || "";
        setForm((prev: any) => ({
          ...prev,
          city,
          state,
        }));
      }
    } catch (err) {
      console.log("Could not extract city/state from location");
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

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (!user?.name) {
        throw new Error("Account name not found. Please re-login.");
      }

      if (!form.latitude || !form.longitude) {
        throw new Error("Please select a location on the map");
      }

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          sport: form.sport === "Other" ? form.sportOther : form.sport,
          // Use the sport as the tournament display name per requirements
          name: form.sport === "Other" ? form.sportOther : form.sport,
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 transition-colors relative overflow-hidden">
      <SportsDoodlesBackground />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header Section */}
        <div className="flex-shrink-0 px-6 pt-6 pb-2">
          {/* Header with Logo */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-slate-500 rounded-2xl blur opacity-30"></div>
              <img
                src="/icon.png"
                alt="Sportify"
                className="relative w-12 h-12 rounded-xl shadow-xl"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-slate-600 dark:from-blue-400 dark:to-slate-400 bg-clip-text text-transparent">
                Create a Tournament
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Fill in the details to organize your event
              </p>
            </div>
          </div>

          {error && (
            <div className="text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-2 rounded-lg border border-red-200 dark:border-red-800 transition-colors shadow-sm flex items-center gap-1">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Main Card Container - Fills remaining space */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Organizer Info Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-slate-600 to-blue-700 flex-shrink-0 p-4">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-xl ring-4 ring-white/30 flex-shrink-0">
                  <span className="text-xl font-bold bg-gradient-to-br from-blue-600 to-slate-600 bg-clip-text text-transparent">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full whitespace-nowrap">
                      ORGANIZER
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white mt-0.5 truncate">
                    {user?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-white/80 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="hidden lg:flex flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-white/70 uppercase tracking-wide">
                      Creator
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-white justify-end">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Container - Flex grow to fill space, overflow scroll */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <Stepper
                initialStep={1}
                onFinalStepCompleted={submit}
                onValidate={handleStepChange}
                onStepChange={(step) => {
                  setStepError("");
                }}
                stepCircleContainerClassName="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 pt-0 shadow-inner"
                contentClassName=""
                footerClassName="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8"
              >
                {/* Step 1: Basic Information */}
                <Step>
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Basic Information
                    </h2>

                    {stepError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800">
                        {stepError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sport<span className="text-red-500">*</span>
                        </label>
                        <select
                          name="sport"
                          value={form.sport}
                          onChange={handleChange}
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                          required
                        >
                          <option value="">Select a Sport</option>
                          {POPULAR_SPORTS.map((sport) => (
                            <option key={sport} value={sport}>
                              {sport}
                            </option>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {form.sport === "Other" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sport Name<span className="text-red-500">*</span>
                          </label>
                          <input
                            name="sportOther"
                            placeholder="Enter sport name"
                            value={form.sportOther}
                            onChange={handleChange}
                            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                            required
                          />
                        </div>
                      )}
                      <div
                        className={form.sport === "Other" ? "" : "col-span-1"}
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Venue<span className="text-red-500">*</span>
                        </label>
                        <input
                          name="venue"
                          placeholder="Stadium or Ground name"
                          value={form.venue}
                          onChange={handleChange}
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </Step>

                {/* Step 2: Tournament Location */}
                <Step>
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Tournament Location
                    </h2>

                    {stepError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800">
                        {stepError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                        Select Location<span className="text-red-500">*</span>
                      </label>
                      <LocationPicker
                        initialLat={
                          form.latitude ? parseFloat(form.latitude) : 30.3165
                        }
                        initialLng={
                          form.longitude ? parseFloat(form.longitude) : 78.0322
                        }
                        onLocationChange={handleLocationChange}
                        height="300px"
                      />
                      {form.latitude && form.longitude && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                          Coordinates: {form.latitude}, {form.longitude}
                        </p>
                      )}
                    </div>
                  </div>
                </Step>

                {/* Step 3: Dates & Participants */}
                <Step>
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Dates & Participants
                    </h2>

                    {stepError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800">
                        {stepError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                          Registration Start Date
                          <span className="text-red-500">*</span>
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
                          <span className="text-red-500">*</span>
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
                          <span className="text-red-500">*</span>
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
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="maxParticipants"
                          placeholder="e.g. 50"
                          value={form.maxParticipants}
                          onChange={handleChange}
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Entry Fee (INR)
                      </label>
                      <input
                        type="number"
                        name="entryFee"
                        placeholder="0 for free tournament"
                        value={form.entryFee}
                        onChange={handleChange}
                        className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                      />
                    </div>
                  </div>
                </Step>

                {/* Step 4: Details & Rules */}
                <Step>
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Tournament Details
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Describe your tournament..."
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rules & Regulations
                      </label>
                      <textarea
                        name="rules"
                        placeholder="Tournament rules and guidelines..."
                        value={form.rules}
                        onChange={handleChange}
                        rows={4}
                        className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Age Group
                        </label>
                        <input
                          name="ageGroup"
                          placeholder="e.g. U19, Open, 18+"
                          value={form.ageGroup}
                          onChange={handleChange}
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prize Pool (INR)
                        </label>
                        <input
                          type="number"
                          name="prizePool"
                          placeholder="Optional"
                          value={form.prizePool}
                          onChange={handleChange}
                          className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      ℹ️ Contact details will use your account email (
                      {user?.email}) and phone.
                    </div>
                  </div>
                </Step>

                {/* Step 5: Team Settings */}
                <Step>
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Team Registration Settings
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <input
                          type="checkbox"
                          name="allowTeamRegistration"
                          checked={form.allowTeamRegistration}
                          onChange={handleChange}
                          id="teamReg"
                          className="mt-1 rounded border-gray-300 dark:border-gray-600"
                        />
                        <div>
                          <label
                            htmlFor="teamReg"
                            className="text-gray-900 dark:text-white font-medium transition-colors cursor-pointer"
                          >
                            Allow Team Registration
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Enable this if participants can register as teams
                            instead of individuals
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                        Ready to Create!
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Click "Complete" to create your tournament. You'll be
                        redirected to your dashboard where you can manage
                        registrations.
                      </p>
                    </div>
                  </div>
                </Step>
              </Stepper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

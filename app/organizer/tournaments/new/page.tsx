"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import DashboardNavbar from "@/components/DashboardNavbar";
import ProfileModal from "@/components/ProfileModal";
import LocationPicker from "@/components/LocationPicker";
import LoadingScreen from "@/components/LoadingScreen";
import { INDIAN_STATES } from "@/lib/indianStates";
import Stepper, { Step } from "@/components/Stepper";
import { motion } from "framer-motion";
import { Suspense } from "react";

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
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NewTournamentPageContent />
    </Suspense>
  );
}

function NewTournamentPageContent() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = Boolean(editId);
  const latestLocationRef = useRef({
    city: "",
    district: "",
    state: "",
  });

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
    district: "",
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
  const [showProfile, setShowProfile] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationModalKey, setLocationModalKey] = useState(0);

  // Local ISO date string (YYYY-MM-DD) without timezone issues
  const todayStr = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const loadTournament = async () => {
      if (!editId) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/tournaments/${editId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tournament");

        const tournament = data.tournament;
        setForm((prev: any) => ({
          ...prev,
          sport: tournament.sport || "",
          sportOther: "",
          description: tournament.description || "",
          venue: tournament.venue || "",
          city: tournament.city || "",
          district: tournament.district || tournament.city || "",
          state: tournament.state || "",
          latitude: tournament.location?.coordinates?.[1]?.toString() || "",
          longitude: tournament.location?.coordinates?.[0]?.toString() || "",
          registrationStartDate: tournament.registrationStartDate
            ? new Date(tournament.registrationStartDate).toLocaleDateString(
                "en-CA",
              )
            : tournament.startDate
              ? new Date(tournament.startDate).toLocaleDateString("en-CA")
              : prev.registrationStartDate,
          registrationDeadline: tournament.registrationDeadline
            ? new Date(tournament.registrationDeadline).toLocaleDateString(
                "en-CA",
              )
            : "",
          tournamentStartDate: tournament.startDate
            ? new Date(tournament.startDate).toLocaleDateString("en-CA")
            : "",
          maxParticipants: tournament.maxParticipants?.toString() || "",
          allowTeamRegistration: Boolean(tournament.allowTeamRegistration),
          teamSize: tournament.teamSize?.toString() || "",
          entryFee: tournament.entryFee?.toString() || "",
          prizePool: tournament.prizePool?.toString() || "",
          rules: tournament.rules || "",
          ageGroup: tournament.ageGroup || "",
        }));
      } catch (error: any) {
        setError(error.message || "Failed to load tournament");
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [editId]);

  // Validation functions for each step
  // NOTE: validation functions are pure and return [valid, message].
  // Avoid calling setState during validation; setStepError is scheduled
  const validateStep1 = (): [boolean, string] => {
    if (!form.sport) {
      return [false, "Please select a sport"];
    }
    if (form.sport === "Other" && !form.sportOther.trim()) {
      return [false, "Please enter the sport name"];
    }
    if (!form.venue.trim()) {
      return [false, "Please enter the venue"];
    }
    return [true, ""];
  };

  const validateStep2 = (): [boolean, string] => {
    if (!form.latitude || !form.longitude) {
      return [false, "Please select a location on the map"];
    }
    const latestLocation = latestLocationRef.current;
    if (!form.city && !latestLocation.city) {
      return [
        false,
        "City could not be detected from location. Please try a different location.",
      ];
    }
    if (!form.district && !latestLocation.district) {
      return [
        false,
        "District could not be detected from location. Please try a different location.",
      ];
    }
    if (!form.state && !latestLocation.state) {
      return [
        false,
        "State could not be detected from location. Please try a different location.",
      ];
    }
    return [true, ""];
  };

  const validateStep3 = (): [boolean, string] => {
    if (!form.registrationStartDate) {
      return [false, "Please enter registration start date"];
    }
    if (!form.registrationDeadline) {
      return [false, "Please enter registration deadline"];
    }
    if (!form.tournamentStartDate) {
      return [false, "Please enter tournament start date"];
    }
    if (!form.maxParticipants) {
      return [false, "Please enter max participants"];
    }
    if (parseInt(form.maxParticipants) < 2) {
      return [false, "Max participants must be at least 2"];
    }
    return [true, ""];
  };

  const validateStep4 = (): [boolean, string] => {
    // Description and Rules are optional
    return [true, ""];
  };

  const validateStep5 = (): [boolean, string] => {
    if (form.allowTeamRegistration) {
      if (!form.teamSize) {
        return [false, "Please enter team size"];
      }
      if (parseInt(form.teamSize) < 2) {
        return [false, "Team size must be at least 2"];
      }
    }
    return [true, ""];
  };

  const handleStepChange = (step: number): boolean => {
    let result: [boolean, string] = [true, ""];
    if (step === 1) result = validateStep1();
    else if (step === 2) result = validateStep2();
    else if (step === 3) result = validateStep3();
    else if (step === 4) result = validateStep4();
    else if (step === 5) result = validateStep5();

    // Schedule setting stepError asynchronously to avoid setState during render
    setTimeout(() => {
      setStepError(result[0] ? "" : result[1]);
    }, 0);

    return result[0];
  };

  const handleLocationChange = async (
    lat: number,
    lng: number,
    address?: string,
    locationDetails?: {
      city?: string;
      district?: string;
      state?: string;
    },
  ) => {
    latestLocationRef.current = {
      city: locationDetails?.city || "",
      district: locationDetails?.district || "",
      state: locationDetails?.state || "",
    };

    setForm((prev: any) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    if (address) {
      setSelectedLocation(address);
    }

    if (
      locationDetails?.city ||
      locationDetails?.district ||
      locationDetails?.state
    ) {
      setForm((prev: any) => ({
        ...prev,
        city: locationDetails.city || prev.city,
        district: locationDetails.district || prev.district,
        state: locationDetails.state || prev.state,
      }));
      return;
    }

    // Extract city and state from coordinates using reverse geocoding
    try {
      const response = await fetch(
        `/api/location/reverse?lat=${lat}&lng=${lng}`,
      );
      const data = await response.json();
      if (data.result) {
        latestLocationRef.current = {
          city: data.result.city || "",
          district: data.result.district || "",
          state: data.result.state || "",
        };
        setForm((prev: any) => ({
          ...prev,
          city: data.result.city || prev.city,
          district: data.result.district || prev.district,
          state: data.result.state || prev.state,
        }));
      }
    } catch (err) {
      console.log("Could not extract city/district/state from location");
    }
  };

  // Show loading screen while auth context is initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

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

      const res = await fetch(
        isEditMode ? `/api/tournaments/${editId}` : "/api/tournaments",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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
            // Send as undefined if empty to avoid stale Mongoose required validator
            description: form.description?.trim() || undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/organizer/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen relative overflow-hidden transition-colors flex flex-col bg-linear-to-br from-indigo-50/40 via-white to-purple-50/40 dark:bg-none dark:bg-[#040812]">
        <DashboardNavbar
          title="Organise a Tournament"
          userName={user?.name || "User"}
          userProfileComplete={isProfileComplete}
          userPhoneVerified={isPhoneVerified}
          onProfileClick={() => setShowProfile(true)}
          onLogout={logout}
        />
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
        <div className="max-w-3xl mx-auto p-6 relative z-10 w-full mt-24">
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

          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 transition-colors relative overflow-hidden">
            {/* Subtle Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-linear-to-b from-indigo-500/5 to-transparent blur-3xl -z-10 transition-colors duration-500"></div>
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
    <div className="min-h-screen relative overflow-hidden transition-colors flex flex-col bg-linear-to-br from-indigo-50/40 via-white to-purple-50/40 dark:bg-none dark:bg-[#040812]">
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
        title={isEditMode ? "Edit Tournament" : "Organise a Tournament"}
        userName={user?.name || "User"}
        userProfileComplete={isProfileComplete}
        userPhoneVerified={isPhoneVerified}
        onProfileClick={() => setShowProfile(true)}
        onLogout={logout}
      />
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
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
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Select Tournament Location
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <LocationPicker
                key={`location-picker-${locationModalKey}`}
                initialLat={form.latitude ? parseFloat(form.latitude) : 30.3165}
                initialLng={
                  form.longitude ? parseFloat(form.longitude) : 78.0322
                }
                initialSelectedLocationDisplay={selectedLocation}
                onLocationChange={(
                  lat: number,
                  lng: number,
                  address?: string,
                ) => {
                  handleLocationChange(lat, lng, address);
                }}
                height="500px"
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-24 px-4 md:px-6 py-4 md:py-6 relative z-10 flex flex-col min-h-[calc(100vh-6rem)]">
        {error && (
          <div className="text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-2 rounded-lg border border-red-200 dark:border-red-800 transition-colors shadow-sm flex items-center gap-1 mb-4">
            <svg
              className="w-4 h-4 shrink-0"
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

        {/* Main Card Container - Fills remaining space */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col max-w-6xl mx-auto w-full relative">
            {/* Subtle Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-linear-to-b from-indigo-500/5 to-transparent blur-3xl -z-10 transition-colors duration-500"></div>
            {/* Organizer header removed per user request */}

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
                contentClassName="min-h-[350px] p-6 overflow-y-auto"
                footerClassName="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8"
              >
                {/* Step 1: Basic Information */}
                <Step>
                  <div className="space-y-4 ml-4 md:ml-8 mt-6 md:mt-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 uppercase tracking-wide">
                      {isEditMode ? "Basic Information" : "Basic Information"}
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
                  </div>
                </Step>

                {/* Step 2: Tournament Location */}
                <Step>
                  <div className="space-y-4 ml-4 md:ml-8 mt-6 md:mt-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 uppercase tracking-wide">
                      Tournament Location
                    </h2>

                    {stepError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800">
                        {stepError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => {
                          setLocationModalKey((prev) => prev + 1);
                          setShowLocationModal(true);
                        }}
                        className="w-full px-6 py-4 bg-linear-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                          />
                        </svg>
                        {form.latitude && form.longitude
                          ? "Change Location"
                          : "Select Location on Map"}
                      </button>

                      {form.latitude && form.longitude && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg">
                          <div className="flex items-start gap-3">
                            <svg
                              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <p className="font-semibold text-green-900 dark:text-green-200">
                                {selectedLocation || "Location Selected"}
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Coordinates: {form.latitude}, {form.longitude}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Step>

                {/* Step 3: Tournament Details */}
                <Step>
                  <div className="space-y-4 ml-4 md:ml-8 mt-6 md:mt-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 uppercase tracking-wide">
                      Tournament Details
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
                          min={todayStr}
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
                          min={todayStr}
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
                          min={todayStr}
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

                {/* Step 4: Other Information */}
                <Step>
                  <div className="space-y-4 ml-4 md:ml-8 mt-6 md:mt-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 uppercase tracking-wide">
                      Other Information
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
                        rows={3}
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
                        rows={3}
                        className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
                      />
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      ℹ️ Contact details will use your account email (
                      {user?.email}) and phone.
                    </div>
                  </div>
                </Step>

                {/* Step 5: Team Settings */}
                <Step>
                  <div className="space-y-4 ml-4 md:ml-8 mt-6 md:mt-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-6 uppercase tracking-wide">
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
                        {isEditMode ? "Ready to Update!" : "Ready to Create!"}
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {isEditMode
                          ? `Click "Complete" to save your changes. You'll be redirected to your dashboard.`
                          : `Click "Complete" to create your tournament. You'll be redirected to your dashboard where you can manage registrations.`}
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

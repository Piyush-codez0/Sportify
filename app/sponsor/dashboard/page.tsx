"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import { motion } from "motion/react";
import { MapPin, CalendarDays, Check } from "lucide-react";
import ProfileModal from "@/components/ProfileModal";
import Stepper, { Step } from "@/components/Stepper";

interface Sponsorship {
  _id: string;
  status: string;
  sponsorshipType: string;
  amount: number;
  tournament: {
    _id: string;
    name: string;
    sport: string;
    city: string;
    state: string;
    startDate: string;
    organizer?: {
      name: string;
      organizationName?: string;
    };
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
  googleMapsLink?: string;
  location?: { type: string; coordinates: [number, number] };
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
  const [paidSponsorships, setPaidSponsorships] = useState<Set<string>>(
    new Set()
  );
  const [payingId, setPayingId] = useState<string | null>(null);
  const [stepperStep, setStepperStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [showTournamentsList, setShowTournamentsList] = useState(false);
  const [selectedTournamentDetails, setSelectedTournamentDetails] =
    useState<Tournament | null>(null);
  const [sponsorshipFilter, setSponsorshipFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const selectedTournamentId = selectedTournament?._id;

  const isProfileComplete = Boolean(user?.city && user?.state && user?.gender);
  const isPhoneVerified = Boolean(user?.phoneVerified);
  const filteredSponsorships = useMemo(() => {
    if (sponsorshipFilter === "all") return sponsorships;
    return sponsorships.filter((s) => s.status === sponsorshipFilter);
  }, [sponsorships, sponsorshipFilter]);

  const sponsorshipCounts = useMemo(
    () => ({
      all: sponsorships.length,
      pending: sponsorships.filter((s) => s.status === "pending").length,
      approved: sponsorships.filter((s) => s.status === "approved").length,
      rejected: sponsorships.filter((s) => s.status === "rejected").length,
    }),
    [sponsorships]
  );

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

        // Debug: Log tournaments to see organizer data
        console.log("Tournaments data:", tData.tournaments);

        setSponsorships(sData.sponsorships);

        // Filter out tournaments that are already sponsored
        const sponsoredTournamentIds = new Set(
          sData.sponsorships.map((s: Sponsorship) => s.tournament._id)
        );
        const availableTournaments = tData.tournaments.filter(
          (t: Tournament) => !sponsoredTournamentIds.has(t._id)
        );

        setTournaments(availableTournaments);
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

  // Hide tournaments list when moving past selection steps
  useEffect(() => {
    if (stepperStep > 1) {
      setShowTournamentsList(false);
    }
  }, [stepperStep]);

  const handlePayment = async (sponsorshipId: string, amount: number) => {
    setPayingId(sponsorshipId);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mark as paid
    setPaidSponsorships((prev) => new Set(prev).add(sponsorshipId));
    setPayingId(null);
  };

  const handleStepValidation = (step: number): boolean => {
    setStepError("");
    if (step === 1) {
      // Step 1: Allow browsing, no validation required
      return true;
    }
    if (step === 2) {
      // Step 2: Fill Details - validate tournament selected and form
      if (!selectedTournament) {
        setStepError("Please select a tournament first");
        return false;
      }
      if (!form.amount) {
        setStepError("Please enter sponsorship amount");
        return false;
      }
      if (parseFloat(form.amount) <= 0) {
        setStepError("Amount must be greater than 0");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleFinalSubmit = async () => {
    if (!selectedTournament) {
      setStepError("Please select a tournament");
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
      setMsg("Sponsorship request submitted successfully!");
      setForm({
        amount: "",
        benefits: "",
        message: "",
      });
      setSelectedTournament(null);
      setStepperStep(1);
      setShowBrowse(false);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setCreating(false);
    }
  };

  const submit = async (e: any) => {
    e.preventDefault();
    handleFinalSubmit();
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
        {/* Tournament Details Modal */}
        {selectedTournamentDetails && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTournamentDetails(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tournament Details
                </h2>
                <button
                  onClick={() => setSelectedTournamentDetails(null)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl font-light"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Tournament Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {selectedTournamentDetails.sport} Tournament
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Organizer
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedTournamentDetails.organizer
                          ?.organizationName ||
                          selectedTournamentDetails.organizer?.name ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Location
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedTournamentDetails.city},{" "}
                        {selectedTournamentDetails.state}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Start Date
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(
                          selectedTournamentDetails.startDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Venue
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedTournamentDetails.venue || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Event Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">
                        Participants
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedTournamentDetails.currentParticipants} /{" "}
                        {selectedTournamentDetails.maxParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">
                        Entry Fee
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{selectedTournamentDetails.entryFee.toLocaleString()}
                      </span>
                    </div>
                    {selectedTournamentDetails.prizePool && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">
                          Prize Pool
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹
                          {selectedTournamentDetails.prizePool.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    {selectedTournamentDetails.contactEmail && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Email
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white break-all">
                          {selectedTournamentDetails.contactEmail}
                        </p>
                      </div>
                    )}
                    {selectedTournamentDetails.contactPhone && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Phone
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedTournamentDetails.contactPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                    <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">
                      Registration Deadline
                    </p>
                    <p className="font-bold text-orange-900 dark:text-orange-100">
                      {new Date(
                        selectedTournamentDetails.registrationDeadline
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-3">
                  <button
                    onClick={() => setSelectedTournamentDetails(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTournament(selectedTournamentDetails);
                      setStepperStep(2);
                      setSelectedTournamentDetails(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg"
                  >
                    Sponsor This Tournament
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded border border-red-200 dark:border-red-800 transition-colors">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-2 flex flex-col border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors h-[82vh] overflow-visible">
            {isProfileComplete && isPhoneVerified ? (
              <>
                <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white transition-colors bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">
                  New Sponsorship
                </h2>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-700 text-sm font-medium transition-colors"
                  >
                    ✓ {msg}
                  </motion.div>
                )}
                {/* Stepper for sponsorship creation */}
                <div className="flex-1 flex flex-col overflow-visible bg-white dark:bg-gray-800 rounded-xl">
                  <Stepper
                    initialStep={stepperStep}
                    onFinalStepCompleted={handleFinalSubmit}
                    onValidate={handleStepValidation}
                    onStepChange={(step) => {
                      setStepError("");
                      setStepperStep(step);
                    }}
                    stepCircleContainerClassName="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-gray-700/50 dark:to-gray-700/50 rounded-t-xl h-15 bg-white"
                    contentClassName="flex-1 overflow-y-auto px-5 py-10"
                    footerClassName="border-t border-gray-200 dark:border-gray-700 p-4 "
                    nextButtonText={stepperStep === 3 ? "Submit" : "Next"}
                  >
                    {/* Step 1: Browse and Select Tournament */}
                    <Step>
                      <div className="space-y-4 h-full flex flex-col ">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 mt-2">
                          Select Tournament
                        </h3>
                        {stepError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-sm"
                          >
                            {stepError}
                          </motion.div>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Browse and select a tournament from the list on the
                          right to sponsor it.
                        </p>
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                          {selectedTournament ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg text-center"
                            >
                              <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
                                ✓ SELECTED TOURNAMENT
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {selectedTournament.sport} Tournament
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                {selectedTournament.organizer
                                  ?.organizationName ||
                                  selectedTournament.organizer?.name}{" "}
                                • {selectedTournament.city}
                              </p>
                              <button
                                onClick={() => {
                                  setStepperStep(1);
                                  setShowTournamentsList(true);
                                }}
                                className="mt-3 w-full px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                              >
                                Change Tournament
                              </button>
                            </motion.div>
                          ) : (
                            <>
                              <div className="text-4xl">🏆</div>
                              <button
                                onClick={() => setShowTournamentsList(true)}
                                className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all font-semibold shadow-lg hover:shadow-xl"
                              >
                                Show Tournaments
                              </button>
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Click to browse available tournaments
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </Step>

                    {/* Step 2: Enter Sponsorship Details */}
                    <Step>
                      <div className="space-y-4 flex-1 overflow-y-auto min-h-0 p-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Sponsorship Details
                        </h3>
                        {stepError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-sm"
                          >
                            {stepError}
                          </motion.div>
                        )}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Tournament
                          </label>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedTournament?.sport} Tournament
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {selectedTournament?.organizer
                                ?.organizationName ||
                                selectedTournament?.organizer?.name}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Sponsorship Amount *
                          </label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={form.amount}
                            onChange={(e) =>
                              setForm({ ...form, amount: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Benefits
                          </label>
                          <textarea
                            placeholder="e.g., Logo placement, Social media mention, Branding rights"
                            value={form.benefits}
                            onChange={(e) =>
                              setForm({ ...form, benefits: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                          />
                        </div>
                      </div>
                    </Step>

                    {/* Step 3: Confirmation */}
                    <Step>
                      <div className="space-y-4 flex-1 overflow-y-auto min-h-0 p-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          Confirm Sponsorship
                        </h3>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
                        >
                          <div className="flex justify-between items-center pb-3 border-b border-blue-200 dark:border-blue-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Tournament:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedTournament?.sport}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-blue-200 dark:border-blue-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Organizer:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedTournament?.organizer
                                ?.organizationName ||
                                selectedTournament?.organizer?.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-blue-200 dark:border-blue-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Amount:
                            </span>
                            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                              ₹{parseFloat(form.amount || "0").toLocaleString()}
                            </span>
                          </div>
                          {form.benefits && (
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Benefits:
                              </span>
                              <p className="text-sm text-gray-900 dark:text-white mt-1">
                                {form.benefits}
                              </p>
                            </div>
                          )}
                        </motion.div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Message
                          </label>
                          <textarea
                            placeholder="Add any additional message..."
                            value={form.message}
                            onChange={(e) =>
                              setForm({ ...form, message: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
                          />
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
                        >
                          <p className="text-sm text-green-700 dark:text-green-300">
                            ✓ Your sponsorship will be sent for approval
                          </p>
                        </motion.div>
                      </div>
                    </Step>
                  </Stepper>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-4">
                <div className="text-3xl">🔒</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Verification Required
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete your profile and verify your phone to create
                  sponsorships.
                </p>
                <div className="w-full space-y-2 text-left text-sm mt-4">
                  <div
                    className={`flex items-center gap-2 p-2 rounded ${
                      isProfileComplete
                        ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                        : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    {isProfileComplete ? "✓" : "✗"} Profile Complete (City,
                    State, Gender)
                  </div>
                  <div
                    className={`flex items-center gap-2 p-2 rounded ${
                      isPhoneVerified
                        ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                        : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    {isPhoneVerified ? "✓" : "✗"} Phone Verified
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(true)}
                  className="mt-4 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                >
                  Complete Profile
                </button>
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-4">
            {showTournamentsList && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white transition-colors">
                    Available Tournaments
                  </h2>
                  <button
                    onClick={() => setShowTournamentsList(false)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    ✕ Back
                  </button>
                </div>
                {loading ? (
                  <div className="text-gray-900 dark:text-white transition-colors">
                    Loading tournaments...
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-2">
                    {tournaments.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-gray-600 dark:text-gray-400">
                        <p className="text-lg">📭 No tournaments available</p>
                        <p className="text-sm mt-2">
                          Check back later for new tournaments
                        </p>
                      </div>
                    ) : (
                      tournaments.map((t) => (
                        <motion.div
                          key={t._id}
                          className={`border rounded-2xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer ${
                            selectedTournamentId === t._id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400"
                              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500"
                          }`}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {t.sport} Tournament
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t.organizer?.organizationName ||
                                  t.organizer?.name}
                              </p>
                            </div>
                            {selectedTournamentId === t._id && (
                              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Selected
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              {t.city}, {t.state}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <CalendarDays className="w-4 h-4" />
                              {new Date(t.startDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedTournamentDetails(t)}
                              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                              Show Details
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedTournament(t);
                                setStepperStep(2);
                                setShowTournamentsList(false);
                              }}
                              className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                            >
                              Sponsor
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {!showTournamentsList && (
              <>
                {sponsorships.length === 0 &&
                isProfileComplete &&
                isPhoneVerified ? (
                  <div>
                    {!showTournamentsList ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center gap-6 p-6"
                      >
                        <div className="text-6xl">🎯</div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Ready to Sponsor?
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Follow the simple steps to sponsor your favorite
                            tournament
                          </p>
                        </div>
                        <div className="space-y-3 w-full max-w-xs">
                          <div className="flex items-start gap-3 text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              1
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Browse Tournaments
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Explore upcoming tournaments
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              2
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Select & Details
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Pick one and enter sponsorship details
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              3
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Submit
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Review and submit for approval
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div>
                        {selectedTournament && !showTournamentsList ? (
                          <div>
                            <div className="mb-3">
                              <h2 className="font-semibold text-gray-900 dark:text-white transition-colors">
                                Selected Tournament
                              </h2>
                            </div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400 rounded-2xl p-5 shadow-lg"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {selectedTournament.sport} Tournament
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {selectedTournament.organizer
                                      ?.organizationName ||
                                      selectedTournament.organizer?.name}
                                  </p>
                                </div>
                                <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Selected
                                </div>
                              </div>
                              <div className="space-y-2 text-sm mb-4">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <MapPin className="w-4 h-4" />
                                  {selectedTournament.city},{" "}
                                  {selectedTournament.state}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <CalendarDays className="w-4 h-4" />
                                  {new Date(
                                    selectedTournament.startDate
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    setSelectedTournamentDetails(
                                      selectedTournament
                                    )
                                  }
                                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                >
                                  Show Details
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setStepperStep(1);
                                    setShowTournamentsList(true);
                                  }}
                                  className="px-3 py-2 bg-orange-500 dark:bg-orange-600 text-white text-xs rounded hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors font-medium"
                                >
                                  Change
                                </motion.button>
                              </div>
                            </motion.div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h2 className="font-semibold text-gray-900 dark:text-white transition-colors">
                                Available Tournaments
                              </h2>
                              <button
                                onClick={() => setShowTournamentsList(false)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                              >
                                ✕ Back
                              </button>
                            </div>
                            {loading ? (
                              <div className="text-gray-900 dark:text-white transition-colors">
                                Loading tournaments...
                              </div>
                            ) : (
                              <div className="grid md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-2">
                                {tournaments.length === 0 ? (
                                  <div className="col-span-2 text-center py-8 text-gray-600 dark:text-gray-400">
                                    <p className="text-lg">
                                      📭 No tournaments available
                                    </p>
                                    <p className="text-sm mt-2">
                                      Check back later for new tournaments
                                    </p>
                                  </div>
                                ) : (
                                  tournaments.map((t) => (
                                    <motion.div
                                      key={t._id}
                                      className={`border rounded-2xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer ${
                                        selectedTournamentId === t._id
                                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400"
                                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500"
                                      }`}
                                      whileHover={{ scale: 1.02, y: -2 }}
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                          <p className="font-bold text-gray-900 dark:text-white">
                                            {t.sport} Tournament
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {t.organizer?.organizationName ||
                                              t.organizer?.name}
                                          </p>
                                        </div>
                                        {selectedTournamentId === t._id && (
                                          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            Selected
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                          <MapPin className="w-4 h-4" />
                                          {t.city}, {t.state}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                          <CalendarDays className="w-4 h-4" />
                                          {new Date(
                                            t.startDate
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 mt-3">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() =>
                                            setSelectedTournamentDetails(t)
                                          }
                                          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                        >
                                          Show Details
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => {
                                            setSelectedTournament(t);
                                            setStepperStep(2);
                                          }}
                                          className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
                                        >
                                          Sponsor
                                        </motion.button>
                                      </div>
                                    </motion.div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : showBrowse ? (
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
                      <div className="grid md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto p-2">
                        {tournaments.map((t) => (
                          <motion.div
                            key={t._id}
                            className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all cursor-pointer"
                            whileHover={{ scale: 1.02, y: -2 }}
                            onClick={() => {
                              setSelectedTournament(t);
                              setStepperStep(2);
                              setShowBrowse(false);
                            }}
                          >
                            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white transition-colors">
                              {t.sport || t.name} Tournament
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                              {t.organizer?.name || t.sport}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                              <span className="font-medium inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> Venue:
                              </span>{" "}
                              {t.venue}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                              <span className="font-medium inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> Location:
                              </span>{" "}
                              {t.city}, {t.state}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  const link =
                                    t.googleMapsLink ||
                                    (t.location?.coordinates
                                      ? `https://maps.google.com/?q=${t.location.coordinates[1]},${t.location.coordinates[0]}`
                                      : `https://maps.google.com/?q=${encodeURIComponent(
                                          t.venue +
                                            ", " +
                                            t.city +
                                            ", " +
                                            t.state
                                        )}`);
                                  window.open(link, "_blank");
                                }}
                                className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline transition-colors"
                              >
                                Open Map →
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                              <span className="font-medium inline-flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5" /> Starts:
                              </span>{" "}
                              {new Date(t.startDate).toLocaleDateString(
                                "en-GB"
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                              <span className="font-medium">
                                Registration Deadline:
                              </span>{" "}
                              {new Date(
                                t.registrationDeadline
                              ).toLocaleDateString("en-GB")}
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
                          </motion.div>
                        ))}
                        {tournaments.length === 0 && (
                          <div className="text-gray-600 dark:text-gray-300 transition-colors">
                            No tournaments available.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : sponsorships.length === 0 && stepperStep === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl text-center">
                      <div className="text-4xl mb-3">🎯</div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Create a New Sponsorship
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Follow the steps on the left to find and sponsor your
                        favorite tournaments
                      </p>
                      <ul className="text-left space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">
                            1
                          </span>
                          Select a tournament from the list
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">
                            2
                          </span>
                          Enter your sponsorship amount and details
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">
                            3
                          </span>
                          Review and submit for approval
                        </li>
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Total Sponsorships
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                          {sponsorships.length}
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Available Tournaments
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                          {tournaments.length}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div id="sponsorships-section">
                    <div className="flex flex-wrap items-center justify-start gap-3 mb-3">
                      <h2 className="font-semibold text-gray-900 dark:text-white transition-colors">
                        Your Sponsorships
                      </h2>
                    </div>
                    {sponsorships.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {["all", "pending", "approved", "rejected"].map(
                          (key) => (
                            <button
                              key={key}
                              onClick={() => setSponsorshipFilter(key as any)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                sponsorshipFilter === key
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-blue-400"
                              }`}
                            >
                              {key === "all"
                                ? `All (${sponsorshipCounts.all})`
                                : key === "pending"
                                ? `Pending (${sponsorshipCounts.pending})`
                                : key === "approved"
                                ? `Current (${sponsorshipCounts.approved})`
                                : `Previous (${sponsorshipCounts.rejected})`}
                            </button>
                          )
                        )}
                      </div>
                    )}
                    {loading ? (
                      <div className="text-gray-900 dark:text-white transition-colors">
                        Loading...
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {filteredSponsorships.map((s) => (
                          <div
                            key={s._id}
                            className="border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 shadow transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">
                              {s.tournament.sport
                                ? `${s.tournament.sport} Tournament`
                                : s.tournament.name
                                ? `${s.tournament.name} Tournament`
                                : "Tournament"}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors">
                              {s.tournament.organizer?.name || "Organizer"} •{" "}
                              {s.tournament.city || "Location"}
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
                                {paidSponsorships.has(s._id) ? (
                                  <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                                  >
                                    <Check className="w-5 h-5" />
                                    Paid ₹{s.amount.toLocaleString()}{" "}
                                    Successfully
                                  </motion.div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handlePayment(s._id, s.amount)
                                    }
                                    disabled={payingId === s._id}
                                    className="mt-3 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                  >
                                    {payingId === s._id ? (
                                      <>
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            ease: "linear",
                                          }}
                                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Processing...
                                      </>
                                    ) : (
                                      <>💳 Pay ₹{s.amount.toLocaleString()}</>
                                    )}
                                  </button>
                                )}
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
              </>
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

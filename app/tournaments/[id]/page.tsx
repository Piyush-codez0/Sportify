"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";
import MapDisplay from "@/components/MapDisplay";

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  description: string;
  rules?: string;
  city: string;
  state: string;
  venue: string;
  location?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  googleMapsLink?: string;
  allowTeamRegistration: boolean;
  teamSize?: number;
  entryFee: number;
  prizePool?: number;
  ageGroup?: string;
  maxParticipants?: number;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  organizer?: {
    _id: string;
    name: string;
    organizationName?: string;
  };
}

export default function TournamentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, token } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Registration state
  const [registrationType, setRegistrationType] = useState<
    "individual" | "team"
  >("individual");
  const [aadharFrontFile, setAadharFrontFile] = useState<File | null>(null);
  const [aadharBackFile, setAadharBackFile] = useState<File | null>(null);
  const [aadharFrontUrl, setAadharFrontUrl] = useState("");
  const [aadharBackUrl, setAadharBackUrl] = useState("");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]); // {name,email,phone,aadharNumber,aadharFrontDocument,aadharBackDocument}
  const [memberCount, setMemberCount] = useState(0);
  const [regLoading, setRegLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [regMessage, setRegMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/tournaments/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setTournament(data.tournament);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (tournament?.allowTeamRegistration && tournament.teamSize) {
      setMemberCount(tournament.teamSize);
      setTeamMembers(
        Array.from({ length: tournament.teamSize }, () => ({
          name: "",
          email: "",
          phone: "",
          aadharNumber: "",
          aadharDocument: "",
        }))
      );
    }
  }, [tournament]);

  const uploadAadhar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload/aadhar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleUploadFront = async () => {
    if (!aadharFrontFile) return;
    try {
      setUploadingFront(true);
      setRegMessage("Uploading Aadhar front...");
      const url = await uploadAadhar(aadharFrontFile);
      setAadharFrontUrl(url);
      setRegMessage("Aadhar front uploaded");
    } catch (e: any) {
      setRegMessage(e.message);
    } finally {
      setUploadingFront(false);
    }
  };

  const handleUploadBack = async () => {
    if (!aadharBackFile) return;
    try {
      setUploadingBack(true);
      setRegMessage("Uploading Aadhar back...");
      const url = await uploadAadhar(aadharBackFile);
      setAadharBackUrl(url);
      setRegMessage("Aadhar back uploaded");
    } catch (e: any) {
      setRegMessage(e.message);
    } finally {
      setUploadingBack(false);
    }
  };

  const handleTeamMemberAadharFront = async (index: number, file: File) => {
    try {
      setRegMessage(`Uploading member ${index + 1} Aadhar front...`);
      const url = await uploadAadhar(file);
      setTeamMembers((prev) =>
        prev.map((m, i) =>
          i === index ? { ...m, aadharFrontDocument: url } : m
        )
      );
      setRegMessage(`Member ${index + 1} Aadhar front uploaded`);
    } catch (e: any) {
      setRegMessage(e.message);
    }
  };

  const handleTeamMemberAadharBack = async (index: number, file: File) => {
    try {
      setRegMessage(`Uploading member ${index + 1} Aadhar back...`);
      const url = await uploadAadhar(file);
      setTeamMembers((prev) =>
        prev.map((m, i) =>
          i === index ? { ...m, aadharBackDocument: url } : m
        )
      );
      setRegMessage(`Member ${index + 1} Aadhar back uploaded`);
    } catch (e: any) {
      setRegMessage(e.message);
    }
  };

  const startPayment = async (registrationId: string, order: any) => {
    setPaymentLoading(true);
    try {
      // Load Razorpay script if not present
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Sportify Tournament",
        description: tournament?.name,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/registrations/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                registrationId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok)
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            setRegMessage("Payment successful and verified!");
          } catch (e: any) {
            setRegMessage(e.message);
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#4f46e5" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setRegMessage(e.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const register = async () => {
    if (!user || user.role !== "player") {
      setRegMessage("Login as player to register");
      return;
    }
    setRegLoading(true);
    setRegMessage("Submitting registration...");
    try {
      let payload: any = { tournamentId: id, registrationType };
      if (registrationType === "individual") {
        if (!aadharFrontUrl || !aadharBackUrl)
          throw new Error("Upload both Aadhar front and back");
        payload.aadharNumber = "NA"; // Could collect number field
        payload.aadharDocument = aadharFrontUrl;
        payload.aadharBackDocument = aadharBackUrl;
        console.log("Sending individual registration payload:", payload);
      } else {
        if (!teamName) throw new Error("Team name required");
        const incomplete = teamMembers.some(
          (m) =>
            !m.name ||
            !m.email ||
            !m.phone ||
            !m.aadharNumber ||
            !m.aadharFrontDocument ||
            !m.aadharBackDocument
        );
        if (incomplete)
          throw new Error(
            "All team member fields + Aadhar (front & back) required"
          );
        payload.teamName = teamName;
        payload.teamMembers = teamMembers;
      }
      const res = await fetch("/api/registrations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      // Check if already registered (success response)
      if (data.alreadyRegistered) {
        setRegMessage("You have already registered for this tournament");
        return;
      }

      if (!res.ok) {
        console.error("Registration error:", data);
        throw new Error(data.error || "Registration failed");
      }
      setRegMessage("Registration created");
      if (data.razorpayOrder) {
        await startPayment(data.registration._id, data.razorpayOrder);
      } else {
        // Check if payment was expected
        if (tournament.entryFee > 0) {
          setRegMessage(
            `Registration successful! Payment of ₹${tournament.entryFee} is pending. Please contact the organizer for payment details.`
          );
        } else {
          setRegMessage("Registered successfully - No payment needed");
        }
      }
    } catch (e: any) {
      console.error("Registration error:", e);
      setRegMessage(`Error: ${e.message}`);
    } finally {
      setRegLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-6">
        <SportsDoodlesBackground />
        <div className="relative z-10 text-gray-900 dark:text-white">
          Loading...
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-6">
        <SportsDoodlesBackground />
        <div className="relative z-10 text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  if (!tournament)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-6">
        <SportsDoodlesBackground />
        <div className="relative z-10 text-gray-900 dark:text-white">
          Not found
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 relative transition-colors py-8">
      <SportsDoodlesBackground />
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="bg-white/90 dark:bg-[#1E2939]/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transition-colors overflow-hidden">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/icon.png"
                  alt="Sportify"
                  className="w-10 h-10 rounded-xl shadow-lg"
                />
                <Link
                  href="/"
                  className="text-lg font-bold text-white hover:opacity-80 transition-opacity"
                >
                  Sportify
                </Link>
              </div>
              <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
                {tournament.sport} Tournament
              </h1>
              {/* {tournament.name && (
                <p className="text-xl font-semibold mb-3 text-white/90">
                  {tournament.name}
                </p>
              )} */}
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                {/* <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                  <span className="font-medium">Tournament: {tournament.name}</span>
                </div> */}
                <div className="flex items-center gap-2">
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
                    {tournament.city}, {tournament.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{tournament.venue}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {tournament.prizePool && tournament.prizePool > 0 && (
                  <div className="relative inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"
                      style={{
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s infinite",
                      }}
                    ></div>
                    <span className="text-lg font-bold relative z-10">
                      🏆 Prize Pool: ₹{tournament.prizePool.toLocaleString()}
                    </span>
                  </div>
                )}
                {tournament.entryFee !== undefined && (
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <span className="text-lg font-bold">
                      {tournament.entryFee === 0
                        ? "🎁 Free Entry"
                        : `💳 Entry Fee: ₹${tournament.entryFee}`}
                    </span>
                  </div>
                )}
              </div>
              <style jsx>{`
                @keyframes shimmer {
                  0% {
                    background-position: -200% 0;
                  }
                  100% {
                    background-position: 200% 0;
                  }
                }
              `}</style>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Quick Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Start Date
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(tournament.startDate).toLocaleDateString("en-GB")}
                </div>
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const startDate = new Date(tournament.startDate);
                  startDate.setHours(0, 0, 0, 0);
                  const daysRemaining = Math.ceil(
                    (startDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  if (daysRemaining > 0) {
                    return (
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                        {daysRemaining} {daysRemaining === 1 ? "day" : "days"}{" "}
                        away
                      </div>
                    );
                  } else if (daysRemaining === 0) {
                    return (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                        Starts today!
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                        Tournament started
                      </div>
                    );
                  }
                })()}
              </div>
              {tournament.registrationDeadline && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Registration Deadline
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(
                      tournament.registrationDeadline
                    ).toLocaleDateString("en-GB")}
                  </div>
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const deadline = new Date(tournament.registrationDeadline);
                    deadline.setHours(0, 0, 0, 0);
                    const daysRemaining = Math.ceil(
                      (deadline.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    if (daysRemaining > 0) {
                      return (
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">
                          {daysRemaining} {daysRemaining === 1 ? "day" : "days"}{" "}
                          remaining
                        </div>
                      );
                    } else if (daysRemaining === 0) {
                      return (
                        <div className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                          Last day to register!
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                          Registration closed
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
              {tournament.maxParticipants && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Max Participants
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {tournament.maxParticipants}
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            {tournament.description && (
              <div className="mb-6 p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl border border-purple-200 dark:border-purple-700">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About Tournament
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {tournament.description}
                </p>
              </div>
            )}

            {/* Rules Section */}
            {tournament.rules && (
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200 dark:border-blue-700">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Tournament Rules
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {tournament.rules}
                </p>
              </div>
            )}

            {/* Organizer Info */}
            {tournament.organizer && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Organized by
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tournament.organizer.organizationName ||
                    tournament.organizer.name}
                </div>
              </div>
            )}
            {/* Location Map */}
            {tournament.location?.coordinates && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
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
                  Venue Location
                </h2>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                  <MapDisplay
                    lat={tournament.location.coordinates[1]}
                    lng={tournament.location.coordinates[0]}
                    popupText={`<strong>${tournament.name}</strong><br/>${tournament.venue}<br/>${tournament.city}, ${tournament.state}`}
                    height="350px"
                    zoom={15}
                  />
                </div>
              </div>
            )}

            {/* Primary CTAs: Player Register and Sponsor */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <Link
                href={`/auth/register?role=player`}
                className="flex-1 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-purple-500/30"
              >
                🚀 Register as Player
              </Link>
              <Link
                href={`/auth/register?role=sponsor&tournamentId=${id}`}
                className="flex-1 text-center bg-white dark:bg-gray-800 border-2 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300 font-semibold py-3.5 px-6 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-600 dark:hover:border-purple-500 transition-all duration-300 hover:scale-[1.02]"
              >
                💼 Sponsor This Tournament
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

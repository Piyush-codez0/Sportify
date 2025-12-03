"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SportsDoodlesBackground from "@/components/SportsDoodlesBackground";

interface Tournament {
  _id: string;
  name: string;
  sport: string;
  description: string;
  city: string;
  state: string;
  venue: string;
  googleMapsLink?: string;
  allowTeamRegistration: boolean;
  teamSize?: number;
  entryFee: number;
  startDate: string;
  endDate: string;
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
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-white/80 dark:bg-[#1E2939]/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/icon.png"
              alt="Sportify"
              className="w-10 h-10 rounded-xl shadow-lg"
            />
            <Link
              href="/"
              className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Sportify
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">
            {tournament.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-200 mb-2 transition-colors">
            {tournament.sport} • {tournament.city}, {tournament.state}
          </p>
          <p className="text-sm mb-4 text-gray-700 dark:text-gray-200 transition-colors">
            {tournament.description}
          </p>
          {tournament.googleMapsLink && (
            <a
              href={tournament.googleMapsLink}
              target="_blank"
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline transition-colors"
            >
              View on Google Maps
            </a>
          )}

          {/* Primary CTAs: Player Register and Sponsor */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/auth/register?role=player`}
              className="flex-1 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              🚀 Register as Player
            </Link>
            <Link
              href={`/auth/register?role=sponsor&tournamentId=${id}`}
              className="flex-1 text-center bg-white/90 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-600 text-gray-800 dark:text-gray-100 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-300 hover:scale-[1.02]"
            >
              💼 Sponsor This Tournament
            </Link>
          </div>
          <div
            className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-6 transition-colors"
            id="register"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors">
              Register
            </h2>

            {/* Entry Fee Display */}
            {tournament.entryFee > 0 && (
              <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Entry Fee
                    </p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{tournament.entryFee}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Payment required
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      via Razorpay
                    </p>
                  </div>
                </div>
              </div>
            )}
            {tournament.entryFee === 0 && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <p className="text-green-700 dark:text-green-300 font-medium flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Free Registration - No Entry Fee
                </p>
              </div>
            )}

            {!user && (
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-200 transition-colors">
                Login as Player to register.
              </div>
            )}
            {user?.role === "player" && (
              <div className="space-y-4">
                {tournament.allowTeamRegistration && (
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setRegistrationType("individual")}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                        registrationType === "individual"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50"
                          : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      👤 Individual
                    </button>
                    <button
                      onClick={() => setRegistrationType("team")}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                        registrationType === "team"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50"
                          : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      👥 Team
                    </button>
                  </div>
                )}
                {registrationType === "individual" && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg p-6 space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Upload Aadhar Card
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
                      Please upload both front and back of your Aadhar card
                      (JPG, PNG, or PDF)
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Aadhar Front */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          Aadhar Front
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setAadharFrontFile(e.target.files?.[0] || null)
                          }
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-200"
                        />
                        <button
                          disabled={!aadharFrontFile || uploadingFront}
                          onClick={handleUploadFront}
                          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
                        >
                          {uploadingFront ? "Uploading..." : "Upload Front"}
                        </button>
                        {aadharFrontUrl && (
                          <div className="flex items-center text-green-600 text-sm">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Uploaded Successfully
                          </div>
                        )}
                      </div>

                      {/* Aadhar Back */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          Aadhar Back
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setAadharBackFile(e.target.files?.[0] || null)
                          }
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-200"
                        />
                        <button
                          disabled={!aadharBackFile || uploadingBack}
                          onClick={handleUploadBack}
                          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
                        >
                          {uploadingBack ? "Uploading..." : "Upload Back"}
                        </button>
                        {aadharBackUrl && (
                          <div className="flex items-center text-green-600 text-sm">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Uploaded Successfully
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {registrationType === "team" && (
                  <div className="space-y-4">
                    <input
                      placeholder="Team Name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded w-full transition-colors"
                    />
                    <div className="space-y-3">
                      {teamMembers.map((m, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded transition-colors"
                        >
                          <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white transition-colors">
                            Member {idx + 1}
                          </p>
                          <div className="grid md:grid-cols-3 gap-2">
                            <input
                              placeholder="Name"
                              value={m.name}
                              onChange={(e) =>
                                setTeamMembers((prev) =>
                                  prev.map((mm, i) =>
                                    i === idx
                                      ? { ...mm, name: e.target.value }
                                      : mm
                                  )
                                )
                              }
                              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded transition-colors"
                            />
                            <input
                              placeholder="Email"
                              value={m.email}
                              onChange={(e) =>
                                setTeamMembers((prev) =>
                                  prev.map((mm, i) =>
                                    i === idx
                                      ? { ...mm, email: e.target.value }
                                      : mm
                                  )
                                )
                              }
                              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded transition-colors"
                            />
                            <input
                              placeholder="Phone"
                              value={m.phone}
                              onChange={(e) =>
                                setTeamMembers((prev) =>
                                  prev.map((mm, i) =>
                                    i === idx
                                      ? { ...mm, phone: e.target.value }
                                      : mm
                                  )
                                )
                              }
                              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded transition-colors"
                            />
                            <input
                              placeholder="Aadhar Number"
                              value={m.aadharNumber}
                              onChange={(e) =>
                                setTeamMembers((prev) =>
                                  prev.map((mm, i) =>
                                    i === idx
                                      ? { ...mm, aadharNumber: e.target.value }
                                      : mm
                                  )
                                )
                              }
                              className="border p-2 rounded"
                            />
                          </div>

                          {/* Aadhar Upload Section */}
                          <div className="mt-3 border-t border-gray-300 dark:border-gray-700 pt-3 transition-colors">
                            <p className="text-xs font-medium mb-2 text-gray-900 dark:text-white transition-colors">
                              Upload Aadhar Card (Front & Back)
                            </p>
                            <div className="grid md:grid-cols-2 gap-3">
                              {/* Front */}
                              <div className="space-y-2">
                                <label className="text-xs">Aadhar Front</label>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file)
                                      handleTeamMemberAadharFront(idx, file);
                                  }}
                                  className="block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-200"
                                />
                                {m.aadharFrontDocument && (
                                  <div className="flex items-center text-green-600 text-xs">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Uploaded
                                  </div>
                                )}
                              </div>

                              {/* Back */}
                              <div className="space-y-2">
                                <label className="text-xs">Aadhar Back</label>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file)
                                      handleTeamMemberAadharBack(idx, file);
                                  }}
                                  className="block w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900 dark:file:text-indigo-200"
                                />
                                {m.aadharBackDocument && (
                                  <div className="flex items-center text-green-600 text-xs">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Uploaded
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  disabled={regLoading || paymentLoading}
                  onClick={register}
                  className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                >
                  {regLoading
                    ? "Submitting..."
                    : paymentLoading
                    ? "Opening Payment..."
                    : "Register"}
                </button>
                {regMessage && (
                  <div
                    className={`text-sm mt-2 p-3 rounded-lg transition-colors ${
                      regMessage.includes("already registered")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                        : regMessage.includes("successful") ||
                          regMessage.includes("created")
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
                        : regMessage.includes("Error") ||
                          regMessage.includes("failed")
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {regMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

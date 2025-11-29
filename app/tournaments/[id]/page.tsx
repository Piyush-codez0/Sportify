"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [aadharUrl, setAadharUrl] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]); // {name,email,phone,aadharNumber,aadharDocument}
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

  const handleIndividualAadhar = async () => {
    if (!aadharFile) return;
    try {
      setRegMessage("Uploading Aadhar...");
      const url = await uploadAadhar(aadharFile);
      setAadharUrl(url);
      setRegMessage("Aadhar uploaded");
    } catch (e: any) {
      setRegMessage(e.message);
    }
  };

  const handleTeamMemberAadhar = async (index: number, file: File) => {
    try {
      setRegMessage(`Uploading member ${index + 1} Aadhar...`);
      const url = await uploadAadhar(file);
      setTeamMembers((prev) =>
        prev.map((m, i) => (i === index ? { ...m, aadharDocument: url } : m))
      );
      setRegMessage(`Member ${index + 1} Aadhar uploaded`);
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
        if (!aadharUrl) throw new Error("Upload Aadhar first");
        payload.aadharNumber = "NA"; // Could collect number field
        payload.aadharDocument = aadharUrl;
      } else {
        if (!teamName) throw new Error("Team name required");
        const incomplete = teamMembers.some(
          (m) =>
            !m.name ||
            !m.email ||
            !m.phone ||
            !m.aadharNumber ||
            !m.aadharDocument
        );
        if (incomplete)
          throw new Error("All team member fields + Aadhar required");
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
      if (!res.ok) throw new Error(data.error || "Failed");
      setRegMessage("Registration created");
      if (data.razorpayOrder) {
        await startPayment(data.registration._id, data.razorpayOrder);
      } else {
        setRegMessage("Registered (no payment needed)");
      }
    } catch (e: any) {
      setRegMessage(e.message);
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!tournament) return <div className="p-6">Not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
      <p className="text-gray-600 mb-2">
        {tournament.sport} • {tournament.city}, {tournament.state}
      </p>
      <p className="text-sm mb-4">{tournament.description}</p>
      {tournament.googleMapsLink && (
        <a
          href={tournament.googleMapsLink}
          target="_blank"
          className="text-indigo-600 text-sm hover:underline"
        >
          View on Google Maps
        </a>
      )}
      <div className="mt-6 border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        {!user && (
          <div className="mb-4 text-sm text-gray-700">
            Login as Player to register.
          </div>
        )}
        {user?.role === "player" && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setRegistrationType("individual")}
                className={`px-4 py-2 rounded ${
                  registrationType === "individual"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Individual
              </button>
              {tournament.allowTeamRegistration && (
                <button
                  onClick={() => setRegistrationType("team")}
                  className={`px-4 py-2 rounded ${
                    registrationType === "team"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Team
                </button>
              )}
            </div>
            {registrationType === "individual" && (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                />
                <button
                  disabled={!aadharFile}
                  onClick={handleIndividualAadhar}
                  className="bg-gray-800 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Upload Aadhar
                </button>
                {aadharUrl && (
                  <div className="text-green-600 text-sm">Uploaded</div>
                )}
              </div>
            )}
            {registrationType === "team" && (
              <div className="space-y-4">
                <input
                  placeholder="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <div className="space-y-3">
                  {teamMembers.map((m, idx) => (
                    <div key={idx} className="border p-3 rounded">
                      <p className="text-sm font-semibold mb-2">
                        Member {idx + 1}
                      </p>
                      <div className="grid md:grid-cols-3 gap-2">
                        <input
                          placeholder="Name"
                          value={m.name}
                          onChange={(e) =>
                            setTeamMembers((prev) =>
                              prev.map((mm, i) =>
                                i === idx ? { ...mm, name: e.target.value } : mm
                              )
                            )
                          }
                          className="border p-2 rounded"
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
                          className="border p-2 rounded"
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
                          className="border p-2 rounded"
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
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleTeamMemberAadhar(idx, file);
                          }}
                          className="col-span-2"
                        />
                      </div>
                      {m.aadharDocument && (
                        <p className="text-xs text-green-600 mt-1">
                          Aadhar uploaded
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              disabled={regLoading || paymentLoading}
              onClick={register}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {regLoading
                ? "Submitting..."
                : paymentLoading
                ? "Opening Payment..."
                : "Register"}
            </button>
            {regMessage && <div className="text-sm mt-2">{regMessage}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

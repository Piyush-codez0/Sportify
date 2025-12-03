"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Registration {
  _id: string;
  registrationType: string;
  status: string;
  paymentStatus: string;
  verified: boolean;
  teamName?: string;
  player: { name: string; email: string; phone: string };
  teamMembers?: Array<{
    name: string;
    email: string;
    phone: string;
    aadharNumber: string;
    aadharDocument: string;
  }>;
  aadharNumber?: string;
  aadharDocument?: string;
}

export default function TournamentRegistrations() {
  const { user, token } = useAuth();
  const params = useParams();
  const tournamentId = params?.id as string;
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/organizer/registrations/${tournamentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setRegistrations(data.registrations);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (tournamentId) load();
  }, [token, tournamentId]);

  const verify = async (registrationId: string, verified: boolean) => {
    setActionMessage("Processing...");
    try {
      const res = await fetch("/api/organizer/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registrationId, verified }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRegistrations((prev) =>
        prev.map((r) =>
          r._id === registrationId
            ? {
                ...r,
                verified: data.registration.verified,
                status: data.registration.status,
              }
            : r
        )
      );
      setActionMessage("Updated");
    } catch (e: any) {
      setActionMessage(e.message);
    }
  };

  if (!user || user.role !== "organizer")
    return <div className="p-6">Access denied.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/icon.png"
          alt="Sportify"
          className="w-10 h-10 rounded-xl shadow-lg"
        />
        <h1 className="text-2xl font-bold">Registrations</h1>
      </div>
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>
      )}
      {actionMessage && <div className="mb-4 text-sm">{actionMessage}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {registrations.map((r) => (
            <div key={r._id} className="border p-4 rounded bg-white shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {r.registrationType === "team" ? r.teamName : r.player.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {r.registrationType} • Status: {r.status} • Payment:{" "}
                    {r.paymentStatus}
                  </p>
                  <p className="text-xs mt-1">
                    Verified: {r.verified ? "Yes" : "No"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => verify(r._id, true)}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => verify(r._id, false)}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="mt-3">
                {r.registrationType === "individual" && (
                  <div className="text-xs">
                    Aadhar: {r.aadharNumber}{" "}
                    {r.aadharDocument && (
                      <a
                        href={r.aadharDocument}
                        target="_blank"
                        className="text-indigo-600 ml-2"
                      >
                        View
                      </a>
                    )}
                  </div>
                )}
                {r.registrationType === "team" && (
                  <div className="mt-2 space-y-2">
                    {r.teamMembers?.map((m, i) => (
                      <div key={i} className="text-xs border p-2 rounded">
                        <p>
                          {m.name} • {m.email} • {m.phone}
                        </p>
                        <p>
                          Aadhar: {m.aadharNumber}{" "}
                          {m.aadharDocument && (
                            <a
                              href={m.aadharDocument}
                              target="_blank"
                              className="text-indigo-600 ml-2"
                            >
                              View
                            </a>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {registrations.length === 0 && (
            <div className="text-gray-600">No registrations yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

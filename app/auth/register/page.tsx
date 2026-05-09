"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import { BorderBeam } from "@/components/ui/border-beam";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Users, Award, Briefcase } from "lucide-react";

type Role = "organizer" | "player" | "sponsor";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "+91 ",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // 3D Card Ref
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
      };

      // Build optional redirect based on intent
      let redirectTo: string | undefined;
      const tournamentId = searchParams?.get("tournamentId");
      if (role === "sponsor" && tournamentId) {
        redirectTo = `/sponsor/dashboard?tournamentId=${tournamentId}`;
      }

      await register(userData, redirectTo);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Preselect role from query param (?role=player|sponsor|organizer)
  useEffect(() => {
    const qpRole = (searchParams?.get("role") || "") as Role | "";
    if (qpRole === "organizer" || qpRole === "player" || qpRole === "sponsor") {
      setRole(qpRole);
    }
  }, [searchParams]);

  // Handle 3D Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // max +-10deg
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

    cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040812] flex items-center justify-center px-4 py-8 relative transition-colors overflow-hidden">
      <style>{`
        .card-container {
          perspective: 1200px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
          transform-style: preserve-3d;
          transition: transform 0.08s ease-out;
        }
        :is(.dark) .glass-card {
          background: rgba(10, 20, 45, 0.82);
          border: 1px solid rgba(0, 245, 160, 0.18);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        @media (hover: none) {
          .glass-card { transform: none !important; }
        }
        .glass-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: transparent;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          pointer-events: none;
          z-index: 10;
        }
        :is(.dark) .glass-card::before {
          background: linear-gradient(90deg, transparent, rgba(0,245,160,0.5), rgba(0,217,245,0.5), transparent);
        }
        .neon-input { transition: all 0.2s ease-out !important; }
        .neon-input:focus {
          border-color: rgba(99, 102, 241, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
          transform: translateY(-1px) !important;
          outline: none !important;
        }
        :is(.dark) .neon-input:focus {
          border-color: rgba(0, 245, 160, 0.45) !important;
          box-shadow: 0 0 0 3px rgba(0,245,160,0.1), 0 0 20px rgba(0,245,160,0.08) !important;
        }
        .neon-button {
          background: linear-gradient(135deg, #00f5a0, #00d9f5) !important;
          box-shadow: 0 8px 24px rgba(0,245,160,0.3) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          color: #0a142d !important;
          border: none !important;
          position: relative;
          overflow: visible;
        }
        .neon-button::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, #00f5a0, #00d9f5);
          opacity: 0;
          filter: blur(16px);
          transition: opacity 0.3s ease-out;
          z-index: -1;
        }
        .neon-button:hover {
          transform: translateY(-3px) scale(1.02) !important;
          box-shadow: 0 16px 48px rgba(0,245,160,0.5), 0 0 60px rgba(0,217,245,0.2) !important;
        }
        .neon-button:hover::after {
          opacity: 0.6;
        }
        .neon-button:active {
          transform: translateY(-1px) scale(0.99) !important;
        }
        .orbs-container {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
        }
        .orb {
          position: absolute; border-radius: 50%;
          animation: drift 12s infinite alternate ease-in-out;
          opacity: 0;
        }
        :is(.dark) .orb { opacity: 0.18; }
        .orb1 { width: 520px; height: 520px; top: -10%; left: -10%; background-color: #00f5a0; filter: blur(80px); }
        .orb2 { width: 400px; height: 400px; bottom: -10%; right: -10%; background-color: #00d9f5; filter: blur(80px); animation-delay: -5s; }
        .orb3 { width: 280px; height: 280px; top: 40%; right: -5%; background-color: #7b61ff; filter: blur(80px); animation-delay: -9s; }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(40px, 30px) scale(1.08); }
        }
      `}</style>

      <div className="orbs-container">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 card-container">
        <div
          ref={cardRef}
          onMouseMove={!role ? handleMouseMove : undefined}
          onMouseLeave={!role ? handleMouseLeave : undefined}
          className="glass-card bg-white dark:bg-gray-800 p-4 sm:p-6 transition-colors relative overflow-hidden"
          style={role ? { transform: "none" } : undefined}
        >
          <BorderBeam
            size={150}
            duration={14}
            colorFrom="#22d3ee"
            colorTo="#a78bfa"
            borderWidth={3}
            initialOffset={0}
          />
          <BorderBeam
            size={150}
            duration={14}
            colorFrom="#f472b6"
            colorTo="#f59e0b"
            borderWidth={3}
            initialOffset={50}
            reverse={true}
          />
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none rounded-2xl" />
          <div className="text-center mb-4">
            <Link href="/" className="inline-flex flex-col items-center gap-2">
              <img src="/icon.png" alt="Sportify" className="w-16 h-16 " />
            </Link>
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white transition-colors">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm transition-colors">
              Join Sportify and transform local sports
            </p>
            {role && (
              <div className="mt-3 inline-block px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-full border border-indigo-300 dark:border-indigo-700">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {role === "organizer" && "🏆 Organizer Account"}
                  {role === "player" && "⚽ Player Account"}
                  {role === "sponsor" && "💼 Sponsor Account"}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors">
              {error}
            </div>
          )}

          {!role ? (
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white transition-colors">
                Select Your Role
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Organizer Card */}
                <motion.button
                  onClick={() => setRole("organizer")}
                  className="relative p-8 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-center overflow-hidden group"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0 }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-linear-to-br from-amber-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-10"
                    initial={{ scale: 0, rotate: 0 }}
                    whileHover={{ scale: 1.5, rotate: 180 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div className="absolute -inset-1 bg-linear-to-r from-amber-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl" />
                  <div className="relative z-10">
                    <motion.div
                      className="flex justify-center mb-3"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Award
                        className="w-14 h-14 text-amber-600 dark:text-amber-400"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                      Organizer
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 transition-colors">
                      Create tournaments
                    </p>
                  </div>
                </motion.button>

                {/* Player Card */}
                <motion.button
                  onClick={() => setRole("player")}
                  className="relative p-8 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-center overflow-hidden group"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-linear-to-br from-blue-400 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-30 rounded-xl"
                    initial={{ scale: 0, rotate: 0 }}
                    whileHover={{ scale: 1.25, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-blue-600 rounded-xl opacity-0 group-hover:opacity-35 blur-xl" />
                  <div className="relative z-10">
                    <motion.div
                      className="flex justify-center mb-3"
                      whileHover={{ rotate: [0, -8, 8, -8, 0], scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Users
                        className="w-14 h-14 text-cyan-600 dark:text-cyan-400"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Player
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 transition-colors">
                      Join tournaments
                    </p>
                  </div>
                </motion.button>

                {/* Sponsor Card */}
                <motion.button
                  onClick={() => setRole("sponsor")}
                  className="relative p-8 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-center overflow-hidden group"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-linear-to-br from-purple-400 via-pink-500 to-rose-500 opacity-0 group-hover:opacity-10 rounded-xl"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.5, rotate: -90 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div className="absolute -inset-1 bg-linear-to-r from-purple-500 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl" />
                  <div className="relative z-10">
                    <motion.div
                      className="flex justify-center mb-3"
                      whileHover={{
                        scale: [1, 1.1, 1.2, 1.1, 1],
                        y: [0, -5, -10, -5, 0],
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <Briefcase
                        className="w-14 h-14 text-purple-600 dark:text-purple-400"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      Sponsor
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 transition-colors">
                      Promote brand
                    </p>
                  </div>
                </motion.button>
              </div>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300 transition-colors">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="neon-input w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      maxLength={14}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Ensure it always starts with +91
                        if (!value.startsWith("+91 ")) {
                          value = "+91 ";
                        }
                        // Only allow digits after +91
                        const numberPart = value.slice(4);
                        const cleanedNumber = numberPart
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setFormData({
                          ...formData,
                          phone: "+91 " + cleanedNumber,
                        });
                      }}
                      className="neon-input w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="neon-input w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="neon-input w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 Complete your profile with city, state, gender after
                    registration.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="neon-button w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-400 dark:disabled:bg-indigo-700 transition-colors"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                    or
                  </span>
                </div>
              </div>

              {/* Social Registration Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Sign up with Facebook
                </button>
              </div>

              <button
                type="button"
                onClick={() => setRole(null)}
                className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              >
                ← Back to role selection
              </button>

              <p className="mt-6 text-center text-gray-600 dark:text-gray-300 transition-colors">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

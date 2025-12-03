"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { INDIAN_STATES } from "@/lib/indianStates";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Gender = "male" | "female" | "other";

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, token, refreshUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "verify">("profile");
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Profile form data
  const [profileData, setProfileData] = useState({
    city: "",
    state: "",
    gender: "" as Gender | "",
    organizationName: "",
    sportsPreferences: "",
    companyName: "",
  });

  useEffect(() => {
    if (user) {
      console.log("ProfileModal - User updated:", {
        phoneVerified: user.phoneVerified,
        city: user.city,
        state: user.state,
        gender: user.gender,
      });
      setProfileData({
        city: user.city || "",
        state: user.state || "",
        gender: user.gender || "",
        organizationName: user.organizationName || "",
        sportsPreferences: user.sportsPreferences?.join(", ") || "",
        companyName: user.companyName || "",
      });
    }
  }, [user]);

  const sendOTP = async () => {
    setLoading(true);
    setMessage("");
    // Demo mode: Skip actual OTP sending
    await new Promise((resolve) => setTimeout(resolve, 800));
    setOtpSent(true);
    setLoading(false);
  };

  const verifyOTP = async () => {
    console.log("verifyOTP called, otp length:", otp.length);
    setLoading(true);
    setMessage("");

    // Demo mode: Accept any 6-digit OTP
    if (otp.length === 6) {
      try {
        console.log("Calling verify-phone-demo API...");
        // Update phoneVerified status in backend
        const res = await fetch("/api/profile/verify-phone-demo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API response status:", res.status);
        const data = await res.json();
        console.log("API response data:", data);

        if (res.ok) {
          setMessage("Phone number verified successfully!");
          console.log("Calling refreshUser...");
          // Wait a bit for DB to update
          await new Promise((resolve) => setTimeout(resolve, 500));
          // Refresh user data
          await refreshUser();
          console.log("refreshUser completed");
          // Immediately update local state to reflect verification
          updateUser({ phoneVerified: true });
          // Persist locally across manual reloads
          try {
            localStorage.setItem("phoneVerified", "true");
          } catch {}
          setOtpSent(false);
          setOtp("");
          setActiveTab("profile");
          // Clear message after delay
          setTimeout(() => {
            setMessage("");
          }, 2000);
        } else {
          throw new Error("Verification failed");
        }
      } catch (err: any) {
        setMessage(err.message || "Verification failed");
      }
    } else {
      setMessage("Please enter a 6-digit OTP");
    }

    setLoading(false);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload: any = {
        city: profileData.city,
        state: profileData.state,
        gender: profileData.gender,
      };

      if (user?.role === "organizer") {
        payload.organizationName = profileData.organizationName;
      } else if (user?.role === "player") {
        payload.sportsPreferences = profileData.sportsPreferences
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      } else if (user?.role === "sponsor") {
        payload.companyName = profileData.companyName;
      }

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage("Profile updated successfully!");
      await refreshUser();
      // Auto-clear success prompt after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);
      // Preserve verified status locally in case backend returns stale value
      if (user?.phoneVerified) {
        updateUser({ phoneVerified: true });
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isProfileComplete = user?.city && user?.state && user?.gender;
  const isPhoneVerified = user?.phoneVerified;

  console.log("ProfileModal render:", {
    isProfileComplete,
    isPhoneVerified,
    userPhoneVerified: user?.phoneVerified,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto transition-all animate-slideUp border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={
                  isProfileComplete && isPhoneVerified
                    ? "https://t4.ftcdn.net/jpg/15/25/88/35/360_F_1525883513_jKfrd0siKwgg0vdNFL10xafVcjIOjxel.jpg"
                    : "https://t3.ftcdn.net/jpg/07/51/48/94/360_F_751489462_vwzozYQfB2rQXOYyOrU7sF2awHI2jTEg.jpg"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                My Profile
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className={`p-3 rounded-lg border ${
                isProfileComplete
                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                  : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isProfileComplete
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
                  }`}
                >
                  {isProfileComplete ? (
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-amber-600 dark:text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Profile
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      isProfileComplete
                        ? "text-green-700 dark:text-green-400"
                        : "text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {isProfileComplete ? "Complete" : "Incomplete"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                isPhoneVerified
                  ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                  : "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isPhoneVerified
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-orange-100 dark:bg-orange-900/30"
                  }`}
                >
                  {isPhoneVerified ? (
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-orange-600 dark:text-orange-400"
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
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      isPhoneVerified
                        ? "text-green-700 dark:text-green-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}
                  >
                    {isPhoneVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info summary when verified */}
          {isProfileComplete && isPhoneVerified && (
            <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Name: {user?.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Email: {user?.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Phone: {user?.phone}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Gender: {user?.gender}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Location: {user?.city}, {user?.state}
                  </p>
                </div>
                <button
                  aria-label="Edit info"
                  onClick={() => {
                    setShowEdit(true);
                    setActiveTab("profile");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  title="Edit"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L6 11.172V14h2.828l8.586-8.586a2 2 0 000-2.828z" />
                    <path
                      fillRule="evenodd"
                      d="M4 16a2 2 0 002 2h8a2 2 0 002-2v-5a1 1 0 112 0v5a4 4 0 01-4 4H6a4 4 0 01-4-4V8a4 4 0 014-4h5a1 1 0 110 2H6a2 2 0 00-2 2v8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Tabs (hidden when fully verified unless editing) */}
          {(!isProfileComplete || !isPhoneVerified || showEdit) && (
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-5">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Complete Profile
              </button>
              <button
                onClick={() => setActiveTab("verify")}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "verify"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Verify Phone
              </button>
            </div>
          )}

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.includes("success")
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" &&
            (!isProfileComplete || !isPhoneVerified || showEdit) && (
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.city}
                      onChange={(e) =>
                        setProfileData({ ...profileData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State
                    </label>
                    <select
                      required
                      value={profileData.state}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          state: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setProfileData({ ...profileData, gender: "male" })
                      }
                      className={`p-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        profileData.gender === "male"
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileData({ ...profileData, gender: "female" })
                      }
                      className={`p-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        profileData.gender === "female"
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 11a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM3.515 4.929a1 1 0 011.414 0L6.343 6.343a1 1 0 11-1.414 1.414L3.515 6.343a1 1 0 010-1.414zm11.314 8.485a1 1 0 111.414 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm11 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM4.929 14.829a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414a1 1 0 010-1.414zm8.485-8.485a1 1 0 111.414 1.414l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Female
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileData({ ...profileData, gender: "other" })
                      }
                      className={`p-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        profileData.gender === "other"
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Other
                    </button>
                  </div>
                </div>

                {user?.role === "organizer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileData.organizationName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          organizationName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Sports Academy Name"
                    />
                  </div>
                )}

                {user?.role === "player" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sports Preferences (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={profileData.sportsPreferences}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          sportsPreferences: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Cricket, Football, Badminton"
                    />
                  </div>
                )}

                {user?.role === "sponsor" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Company or Brand Name"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
                {showEdit && (
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 py-2.5 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Done
                  </button>
                )}
              </form>
            )}

          {/* Verify Phone Tab */}
          {activeTab === "verify" && (
            <div className="space-y-4">
              {isPhoneVerified ? (
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Phone Verified
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.phone}
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user?.phone}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      We'll send a 6-digit OTP to verify
                    </p>
                  </div>

                  {!otpSent ? (
                    <button
                      onClick={sendOTP}
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                          OTP sent to your phone
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Enter OTP
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl font-mono tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      <button
                        onClick={verifyOTP}
                        disabled={loading || otp.length !== 6}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </button>
                      <button
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          sendOTP();
                        }}
                        disabled={loading}
                        className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium py-2 transition-colors"
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

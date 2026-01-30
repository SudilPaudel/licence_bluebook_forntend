import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/reset-password", { token, newPassword });
      setMessage(response.data.message || "Password reset successful. You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-10 bg-white/80 shadow-2xl rounded-3xl border border-gray-100 backdrop-blur-lg animate-fade-in">
      <h2 className="text-4xl font-extrabold text-nepal-blue mb-8 text-center tracking-tight animate-slide-down">
        Reset Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-7 animate-fade-in delay-200">
        <div>
          <label className="block font-semibold mb-2 text-left text-gray-800 tracking-wide">
            New Password
          </label>
          <input
            type="password"
            required
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 transition-all duration-200 bg-gray-50 shadow-sm"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-left text-gray-800 tracking-wide">
            Confirm Password
          </label>
          <input
            type="password"
            required
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 transition-all duration-200 bg-gray-50 shadow-sm"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-nepal-blue to-blue-500 text-white py-3 font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-nepal-blue transition-all duration-200 active:scale-95"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {error && (
        <p className="mt-8 text-center text-red-600 font-semibold animate-fade-in-up">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-8 text-center text-green-600 font-semibold animate-fade-in-up">
          {message}
        </p>
      )}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.8s ease both;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1.000) both;
          }
          .animate-slide-down {
            animation: slideDown 0.7s cubic-bezier(.39,.575,.565,1.000) both;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}
export default ResetPassword;
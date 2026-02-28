import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useLang } from "../context/LanguageContext";
import { forgotPasswordLabels } from "../labels/forgotPasswordLabels";

/**
 * ForgotPassword component allows users to request a password reset link by entering their email address.
 */
function ForgotPassword() {
  const { getLabel } = useLang();
  const navigate = useNavigate();
  // State for storing the user's email input
  const [email, setEmail] = useState("");
  // State for displaying a message after form submission
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  /**
   * Handles the form submission for requesting a password reset.
   * Prevents default form behavior, simulates API call, and sets a success message.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      await API.post("/auth/forgot-password", { email });
      // move to OTP screen regardless of backend response (always succeed)
      navigate("/otp-verification", { state: { email } });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to send reset code. Please try again.";
      setMessage(errorMsg);
      setMessageType("error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-10 bg-white/80 shadow-2xl rounded-3xl border border-gray-100 backdrop-blur-lg animate-fade-in">
      <h2 className="text-4xl font-extrabold text-nepal-blue mb-8 text-center tracking-tight animate-slide-down">
        {getLabel(forgotPasswordLabels.forgotPassword)}
      </h2>

      <p className="mb-8 text-center text-gray-600 text-lg animate-fade-in delay-100">
        {getLabel(forgotPasswordLabels.enterEmailInstruction)}
      </p>

      <form onSubmit={handleSubmit} className="space-y-7 animate-fade-in delay-200">
        <div>
          <label className="block font-semibold mb-2 text-left text-gray-800 tracking-wide">
            {getLabel(forgotPasswordLabels.emailAddress)}
          </label>
          <input
            type="email"
            required
            placeholder={getLabel(forgotPasswordLabels.enterEmail)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 transition-all duration-200 bg-gray-50 shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-nepal-blue to-blue-500 text-white py-3 font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-600 hover:to-nepal-blue transition-all duration-200 active:scale-95"
        >
          {getLabel(forgotPasswordLabels.sendResetLink)}
        </button>
      </form>

      {message && (
        <p
          className={`mt-8 text-center font-semibold animate-fade-in-up ${
            messageType === "error" ? "text-red-600" : "text-nepal-blue"
          }`}
        >
          {message}
        </p>
      )}

      {/* Animations */}
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

export default ForgotPassword;

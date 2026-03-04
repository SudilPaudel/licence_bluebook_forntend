import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { otpResetLabels } from "../labels/otpResetLabels";
import API from "../api/api";

function OtpAndResetPassword() {
  // Main component for OTP verification and password reset
  const { getLabel } = useLang();

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  // if someone navigates here manually without providing email, send them back
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  /**
   * Handles the resend timer countdown for OTP.
   * Enables resend button when timer reaches zero.
   */
  useEffect(() => {
    if (resendTimer === 0) {
      setCanResend(true);
      return;
    }
    const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timerId);
  }, [resendTimer]);

  /**
   * Handles changes to the OTP input field.
   * Only allows numeric input and limits to 6 digits.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  /**
   * Handles OTP form submission.
   * Verifies OTP length and sets OTP as verified if valid.
   * @param {React.FormEvent} e
   */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setOtpError(getLabel(otpResetLabels.invalidOtp));
      return;
    }

    try {
      await API.post("/auth/verify-reset-otp", { email, otp });
      setOtpVerified(true);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.message || getLabel(otpResetLabels.invalidOtp));
    }
  };

  /**
   * Handles resending the OTP.
   * Resets the resend timer and disables the resend button.
   */
  const handleResend = async () => {
    if (!canResend) return;
    setResendTimer(30);
    setCanResend(false);
    if (email) {
      try {
        await API.post("/auth/forgot-password", { email });
      } catch (err) {
        // ignore errors, user already informed they got code
      }
    }
  };

  /**
   * Handles new password form submission.
   * Validates password length and match, then resets password.
   * @param {React.FormEvent} e
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(""); // reset error

    if (newPassword.length < 6) {
        setPasswordError(getLabel(otpResetLabels.minPasswordLength));
      return;
    }
    if (newPassword !== confirmPassword) {
        setPasswordError(getLabel(otpResetLabels.passwordMismatch));
      return;
    }

    try {
      const res = await API.post("/auth/reset-password", { email, otp, newPassword });
      // show success message before leaving
      const msg = res.data.message || getLabel(otpResetLabels.passwordResetSuccessLogin);
      setSuccessMessage(msg);
      setPasswordError("");
      // delay navigation so user notices the inline message
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        getLabel(otpResetLabels.passwordResetTryAgain)
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white/80 shadow-2xl rounded-3xl border border-blue-100 backdrop-blur-lg animate-fade-in">
      {!otpVerified ? (
        <>
          <h2 className="text-4xl font-extrabold text-nepal-blue mb-10 text-center tracking-tight animate-slide-down">
            {getLabel(otpResetLabels.otpVerificationTitle)}
          </h2>
          {email && (
            <p className="text-center text-gray-600 mb-6 animate-fade-in">
              {getLabel(otpResetLabels.otpSentTo)}
              {": "}
              <span className="font-semibold">{email}</span>
            </p>
          )}
          <form onSubmit={handleOtpSubmit} className="space-y-8">
            <div className="relative">
              <label className="block font-semibold mb-2 text-left text-gray-700 tracking-wide">
                {getLabel(otpResetLabels.enterOtp)}
              </label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder={getLabel(otpResetLabels.otpPlaceholder)}
                value={otp}
                onChange={handleOtpChange}
                className="w-full border-2 border-blue-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 transition-all duration-300 text-lg tracking-widest bg-blue-50/60 shadow-sm"
                inputMode="numeric"
                pattern="\d{6}"
              />
              {otpError && (
                <p className="text-red-600 text-sm mt-1 animate-shake">{otpError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-nepal-blue to-blue-500 text-white py-3 font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-700 hover:to-nepal-blue transition-all duration-300"
            >
              {getLabel(otpResetLabels.verifyOtp)}
            </button>
          </form>

          <div className="text-center mt-6 text-base text-gray-500 animate-fade-in">
            {getLabel(otpResetLabels.didntGetCode)}{" "}
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`font-bold transition-all duration-200 ${
                canResend
                  ? "text-nepal-blue hover:underline hover:text-blue-700 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              {getLabel(otpResetLabels.resend)} {canResend ? "" : `(${resendTimer}s)`}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-4xl font-extrabold text-nepal-blue mb-10 text-center tracking-tight animate-slide-down">
            {getLabel(otpResetLabels.setNewPassword)}
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-8">
            <div className="relative">
              <label className="block font-semibold mb-2 text-left text-gray-700 tracking-wide">
                {getLabel(otpResetLabels.newPassword)}
              </label>
              <input
                type="password"
                required
                placeholder={getLabel(otpResetLabels.enterNewPasswordPlaceholder)}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border-2 border-blue-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 transition-all duration-300 text-lg bg-blue-50/60 shadow-sm"
              />
            </div>

            <div className="relative">
              <label className="block font-semibold mb-2 text-left text-gray-700 tracking-wide">
                {getLabel(otpResetLabels.confirmPassword)}
              </label>
              <input
                type="password"
                required
                placeholder={getLabel(otpResetLabels.confirmNewPasswordPlaceholder)}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border-2 border-blue-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 transition-all duration-300 text-lg bg-blue-50/60 shadow-sm"
              />
            </div>

            {passwordError && (
              <p className="text-red-600 text-base mb-2 animate-shake">{passwordError}</p>
            )}
            {successMessage && (
              <p className="text-green-600 text-base mb-2 animate-fade-in-up">{successMessage}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-nepal-blue to-blue-500 text-white py-3 font-bold rounded-xl shadow-lg hover:scale-105 hover:from-blue-700 hover:to-nepal-blue transition-all duration-300"
            >
              {getLabel(otpResetLabels.resetPassword)}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default OtpAndResetPassword;

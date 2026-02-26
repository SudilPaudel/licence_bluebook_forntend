import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import API from "../api/api";
import Notification from "../components/Notification";
import { useLang } from "../context/LanguageContext";
import { registerLabels } from "../labels/registerLabels";
import { loginLabels } from "../labels/loginLabels";

function Register() {
  // Main component for user registration and email OTP verification

  const navigate = useNavigate();
  const { getLabel } = useLang();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    citizenshipNo: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // OTP states
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [resendTimer, setResendTimer] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      showNotification("error", "Google sign-in failed. Please try again.");
      return;
    }
    setGoogleLoading(true);
    clearNotification();
    try {
      const response = await API.post("/auth/google", {
        idToken: credentialResponse.credential,
      });
      const data = response.data;

      if (data.success) {
        localStorage.setItem("accessToken", data.result.tokens.accessToken);
        localStorage.setItem("refreshToken", data.result.tokens.refreshToken);
        localStorage.setItem("userDetail", JSON.stringify(data.result.detail));

        showNotification("success", "Login successful! Redirecting...");
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          if (data.result.detail.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else if (data.requireAdditionalInfo) {
        navigate("/google-complete-profile", {
          state: {
            email: data.result?.email,
            name: data.result?.name,
            picture: data.result?.picture || null,
            idToken: credentialResponse.credential,
          },
        });
      } else {
        showNotification("error", data.message || "Google sign-in failed. Please try again.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message?.toString() ||
        "Google sign-in failed. Please try again.";
      showNotification("error", message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    showNotification("error", "Google sign-in failed. Please try again.");
  };

  /**
   * Handles input changes for form fields and image upload.
   * Validates image size and aspect ratio for passport photo.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files.length > 0) {
      const file = files[0];

      if (file.size > 2 * 1024 * 1024) {
        setImageError("Image size must be less than 2MB.");
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const { width, height } = img;
        const ratio = width / height;

        if (ratio < 0.7 || ratio > 0.8) {
          setImageError("Image must be passport-sized (3:4 aspect ratio).");
          setFormData((prev) => ({ ...prev, image: null }));
          setImagePreview(null);
        } else {
          setImageError("");
          setFormData((prev) => ({ ...prev, image: file }));
          setImagePreview(img.src);
        }
      };
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Shows a notification with the given type and message.
   * @param {string} type
   * @param {string} message
   */
  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  /**
   * Clears the notification message.
   */
  const clearNotification = () => {
    setNotification({ type: "", message: "" });
  };

  /**
   * Starts the resend OTP timer countdown.
   */
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Handles registration form submission.
   * Validates passwords and image, sends registration data to API, and shows OTP form on success.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showNotification("error", getLabel(registerLabels.passwordMismatch));
      return;
    }

    setIsLoading(true);
    clearNotification();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("citizenshipNo", formData.citizenshipNo);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("confirmPassword", formData.confirmPassword);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await API.post("/auth/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.result) {
        setUserId(response.data.result.userId);
        showNotification("success", response.data.message || "Registration successful! Please check your email for OTP verification.");
        setShowOtpForm(true);
        startResendTimer();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      showNotification("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles OTP form submission for email verification.
   * Validates OTP and sends verification request to API.
   * @param {React.FormEvent} e
   */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      showNotification("error", "Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    clearNotification();

    try {
      const response = await API.post("/auth/verify-email-otp", {
        userId: userId,
        otp: otp,
      });

      if (response.data.result) {
        showNotification("success", response.data.message || "Email verified successfully! You can now login.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      const message = error.response?.data?.message || "OTP verification failed. Please try again.";
      showNotification("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles resending the OTP for email verification.
   * Sends resend request to API and restarts the resend timer.
   */
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    clearNotification();

    try {
      const response = await API.post("/auth/resend-otp", {
        userId: userId,
      });

      if (response.data.result) {
        showNotification("success", response.data.message || "OTP resent successfully! Please check your email.");
        startResendTimer();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP. Please try again.";
      showNotification("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtpForm) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold text-nepal-blue mb-8 text-center">
          {getLabel(registerLabels.emailVerification)}
        </h2>

        <Notification
          type={notification.type}
          message={notification.message}
          onClose={clearNotification}
        />

        <p className="text-gray-600 mb-6 text-center">
          {getLabel(registerLabels.verificationCodeSent)} <strong>{formData.email}</strong>
        </p>

        <form onSubmit={handleOtpSubmit}>
          <div className="mb-6">
            <label className="block font-medium mb-2 text-left">{getLabel(registerLabels.enterOtp)}</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={getLabel(registerLabels.enter6DigitOtp)}
              className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue text-center text-xl tracking-widest"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !otp || otp.length !== 6}
            className="w-full bg-nepal-blue text-white py-3 font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
            {getLabel(registerLabels.verifyEmail)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">{getLabel(registerLabels.didntReceiveCode)}</p>
          <button
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || isLoading}
            className="text-nepal-blue hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `${getLabel(registerLabels.resendIn)} ${resendTimer}s` : getLabel(registerLabels.resendOtp)}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowOtpForm(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            {getLabel(registerLabels.backToRegistration)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-14 mb-14 p-10 bg-gradient-to-br from-white via-blue-50 to-blue-100 shadow-2xl rounded-3xl border border-blue-100 animate-fade-in">
      <h2 className="text-4xl font-extrabold text-nepal-blue mb-10 text-center tracking-tight drop-shadow animate-slide-down">
        {getLabel(registerLabels.userRegistration)}
      </h2>

      <p className="text-sm text-gray-500 mb-6 text-center">
        {getLabel(registerLabels.requiredNote)}
      </p>

      <Notification
        type={notification.type}
        message={notification.message}
        onClose={clearNotification}
      />

      <form onSubmit={handleSubmit} className="animate-fade-in-slow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.name)} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder={getLabel(registerLabels.enterName)}
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-blue-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 bg-white shadow transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.email)} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder={getLabel(registerLabels.enterEmail)}
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-blue-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 bg-white shadow transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.citizenshipNo)} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="citizenshipNo"
              required
              placeholder={getLabel(registerLabels.enterCitizenshipNo)}
              value={formData.citizenshipNo}
              onChange={handleChange}
              className="w-full border border-blue-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 bg-white shadow transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.password)} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder={getLabel(registerLabels.enterPassword)}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full border border-blue-200 px-5 py-3 pr-12 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 bg-white shadow transition-all duration-200"
              />
              <span
                className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-nepal-blue cursor-pointer transition-colors duration-150"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={0}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.confirmPassword)} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder={getLabel(registerLabels.confirmYourPassword)}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full border border-blue-200 px-5 py-3 pr-12 rounded-xl focus:outline-none focus:ring-4 focus:ring-nepal-blue/30 bg-white shadow transition-all duration-200"
              />
              <span
                className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-nepal-blue cursor-pointer transition-colors duration-150"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={0}
              >
                {showConfirm ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.passportPhoto)}
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-nepal-blue/90 file:text-white hover:file:bg-nepal-blue/100 transition-all duration-200"
            />
            <p className="text-xs text-gray-600 mt-1">
              Requirements: JPG/PNG, max 2MB, 3:4 aspect ratio (e.g. 300x400), plain background, clear full face.
            </p>
            {imageError && (
              <p className="text-red-600 text-sm mt-1 animate-shake">{imageError}</p>
            )}
            {imagePreview && (
              <div className="flex items-center gap-4 mt-2 animate-fade-in">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-[120px] h-[160px] object-cover border-2 border-blue-200 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                />
                <span className="text-gray-500 text-xs">Preview</span>
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 mt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center px-8 py-3 border border-blue-500 rounded-full text-base font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
              ) : null}
              {isLoading ? getLabel(registerLabels.registering) : getLabel(registerLabels.register)}
            </button>
          </div>
        </div>
      </form>

      {hasGoogleClientId && (
        <div className="mt-8 animate-fade-in-slow">
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/90 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_blue"
                size="large"
                text="continue_with"
                shape="rectangular"
                width={320}
                disabled={isLoading || googleLoading}
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      )}

      <div className="mt-8 text-center animate-fade-in-slow">
        <p className="text-gray-600 text-base">
          {getLabel(registerLabels.alreadyHaveAccount)}{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-nepal-blue hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors duration-150"
          >
            {getLabel(registerLabels.loginHere)}
          </button>
        </p>
      </div>
      {/* Animations keyframes (add to your global CSS or Tailwind config if needed) */}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
          @keyframes fade-in-slow {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          @keyframes bounce-in {
            0% { transform: scale(0.95);}
            60% { transform: scale(1.05);}
            100% { transform: scale(1);}
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0);}
            20%, 60% { transform: translateX(-6px);}
            40%, 80% { transform: translateX(6px);}
          }
          .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;}
          .animate-fade-in-slow { animation: fade-in-slow 1.2s cubic-bezier(.4,0,.2,1) both;}
          .animate-slide-down { animation: slide-down 0.7s cubic-bezier(.4,0,.2,1) both;}
          .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(.4,0,.2,1) both;}
          .animate-shake { animation: shake 0.4s;}
        `}
      </style>
    </div>
  );
}

export default Register;

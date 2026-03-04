import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import Notification from "../components/Notification";
import PrimaryButton from "../components/PrimaryButton";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { toast } from "react-toastify";
import { useLang } from "../context/LanguageContext";
import { loginLabels } from "../labels/loginLabels";

/**
 * Login component handles user authentication and login form.
 */
function Login() {
  const navigate = useNavigate();
  const { getLabel } = useLang();

  // State for login form fields
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State for notification messages
  const [notification, setNotification] = useState({ type: "", message: "" });
  // State for loading spinner
  const [loading, setLoading] = useState(false);
  // State for Google sign-in loading
  const [googleLoading, setGoogleLoading] = useState(false);

  /**
   * Handles input changes for form fields and clears notifications.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const isLoggedIn = localStorage.getItem('accessToken');
  useEffect(()=>{
    if(isLoggedIn){
      toast.info(getLabel(loginLabels.alreadyLoggedIn));
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setNotification({ type: "", message: "" }); // Clear notification on input change
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

  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      showNotification("error", getLabel(loginLabels.googleSignInFailed));
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
        showNotification("error", data.message || getLabel(loginLabels.loginFailed));
      }
    } catch (error) {
      console.error("Google login error:", error);
      const message =
        error?.response?.data?.message?.toString() ||
        getLabel(loginLabels.googleSignInFailed);
      showNotification("error", message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    showNotification("error", getLabel(loginLabels.googleSignInFailed));
  };

  /**
   * Handles form submission for login.
   * Sends login request to API, manages tokens, notifications, and redirects.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearNotification();
    try {
      const response = await API.post("/auth/login", formData);
      const data = response.data;

      if (data.success) {
        // Save tokens in localStorage
        localStorage.setItem("accessToken", data.result.tokens.accessToken);
        localStorage.setItem("refreshToken", data.result.tokens.refreshToken);
        localStorage.setItem("userDetail", JSON.stringify(data.result.detail));

        showNotification("success", "Login successful! Redirecting...");

        // Trigger storage event to update Navbar
        window.dispatchEvent(new Event('storage'));

        // Redirect based on user role
        setTimeout(() => {
          if (data.result.detail.role === 'admin') {
            navigate("/admin-dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        showNotification("error", "Login Failed. Please try again with other credentials");
        return;
      }

    } catch (error) {
      console.error("Login error:", error); // for dev visibility
      try {
        const message =
          error?.response?.data?.message?.toString() || "Login failed. Please try again.";
        showNotification("error", message);
      } catch {
        showNotification("error", "Something went wrong during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="w-full max-w-md mx-auto p-10 bg-white/90 shadow-2xl rounded-3xl border border-blue-100 backdrop-blur-md animate-fade-in-up">
        <h2 className="text-4xl font-extrabold text-nepal-blue mb-10 text-center tracking-tight drop-shadow animate-fade-in">
          {getLabel(loginLabels.userLogin)}
        </h2>

        <Notification
          type={notification.type}
          message={notification.message}
          onClose={clearNotification}
        />

        <form onSubmit={handleSubmit} className="animate-fade-in delay-100">
          <p className="text-sm text-gray-500 mb-2">{getLabel(loginLabels.requiredNote)}</p>
          <div className="space-y-8">
            {/* Email */}
            <div className="relative group">
              <label className="block font-semibold mb-2 text-left text-gray-700 group-hover:text-nepal-blue transition">
                {getLabel(loginLabels.email)} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder={getLabel(loginLabels.enterEmail)}
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-200 px-5 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:border-nepal-blue transition bg-gray-50 group-hover:bg-blue-50"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label className="block font-semibold mb-2 text-left text-gray-700 group-hover:text-nepal-blue transition">
                {getLabel(loginLabels.password)} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder={getLabel(loginLabels.enterPassword)}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 px-5 py-3 pr-12 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:border-nepal-blue transition bg-gray-50 group-hover:bg-blue-50"
                  disabled={loading}
                />
                <span
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-nepal-blue cursor-pointer transition"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <FaEye className="animate-fade-in" /> : <FaEyeSlash className="animate-fade-in" />}
                </span>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-nepal-blue hover:underline hover:text-blue-700 transition"
              >
                {getLabel(loginLabels.forgotPassword)}
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              <PrimaryButton type="submit" loading={loading} className="w-full">
                {getLabel(loginLabels.login)}
              </PrimaryButton>
            </div>

            {/* Divider and Google Sign-In */}
            {hasGoogleClientId && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white/90 text-gray-500">
                      {getLabel(loginLabels.orContinueWith)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    loading={googleLoading}
                    disabled={loading || googleLoading}
                    label={getLabel(loginLabels.continueWithGoogle)}
                    variant="oval"
                  />
                </div>
              </>
            )}
          </div>
        </form>

        <div className="mt-8 text-center animate-fade-in delay-200">
          <p className="text-gray-600">
            {getLabel(loginLabels.dontHaveAccount)}{" "}
            <Link
              to="/signup"
              className="text-nepal-blue hover:text-blue-700 font-semibold underline underline-offset-2 transition"
            >
              {getLabel(loginLabels.registerHere)}
            </Link>
          </p>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.9s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}

export default Login;

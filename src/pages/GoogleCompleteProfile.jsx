import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import Notification from "../components/Notification";
import { useLang } from "../context/LanguageContext";
import { registerLabels } from "../labels/registerLabels";

function GoogleCompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getLabel } = useLang();

  const state = location.state || {};
  const initialEmail = state.email || "";
  const initialName = state.name || "";
  const picture = state.picture || null;
  const idToken = state.idToken || "";

  const [citizenshipNo, setCitizenshipNo] = useState("");
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const clearNotification = () => {
    setNotification({ type: "", message: "" });
  };

  const handleImageChange = (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must be less than 2MB.");
      setImageFile(null);
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
        setImageFile(null);
        setImagePreview(null);
      } else {
        setImageError("");
        setImageFile(file);
        setImagePreview(img.src);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idToken) {
      showNotification("error", "Google session expired. Please sign in with Google again.");
      return;
    }

    if (!citizenshipNo) {
      showNotification("error", getLabel(registerLabels.enterCitizenshipNo));
      return;
    }

    setIsLoading(true);
    clearNotification();

    try {
      const formData = new FormData();
      formData.append("idToken", idToken);
      formData.append("citizenshipNo", citizenshipNo);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await API.post("/auth/google-complete-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = response.data;

      if (data.success) {
        localStorage.setItem("accessToken", data.result.tokens.accessToken);
        localStorage.setItem("refreshToken", data.result.tokens.refreshToken);
        localStorage.setItem("userDetail", JSON.stringify(data.result.detail));

        showNotification("success", data.message || "Account created successfully! Redirecting...");
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          if (data.result.detail.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        showNotification("error", data.message || "Failed to complete profile. Please try again.");
      }
    } catch (error) {
      console.error("Google complete profile error:", error);
      const message =
        error?.response?.data?.message?.toString() ||
        "Failed to complete profile. Please try again.";
      showNotification("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // If user lands here without proper state (e.g. direct URL), redirect them to login.
  if (!idToken || !initialEmail) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="w-full max-w-md mx-auto p-8 bg-white/95 shadow-2xl rounded-3xl border border-blue-100">
        <h2 className="text-3xl font-extrabold text-nepal-blue mb-6 text-center tracking-tight">
          {getLabel(registerLabels.userRegistration)}
        </h2>

        <p className="text-gray-700 mb-4 text-center">
          Please confirm your details and enter your citizenship number and passport-size photo to complete registration.
        </p>

        <Notification
          type={notification.type}
          message={notification.message}
          onClose={clearNotification}
        />

        <div className="flex flex-col items-center mb-6">
          {picture ? (
            <img
              src={picture}
              alt="Google profile"
              className="h-24 w-24 rounded-full object-cover border-4 border-blue-200 shadow-lg mb-3"
            />
          ) : null}
          <div className="text-center">
            <p className="font-semibold text-gray-900">{initialName}</p>
            <p className="text-sm text-gray-600">{initialEmail}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.citizenshipNo)} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="citizenshipNo"
              required
              placeholder={getLabel(registerLabels.enterCitizenshipNo)}
              value={citizenshipNo}
              onChange={(e) => setCitizenshipNo(e.target.value)}
              className="w-full border border-blue-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue/60 bg-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block font-semibold mb-1 text-left text-gray-700">
              {getLabel(registerLabels.passportPhoto)}
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-nepal-blue/90 file:text-white hover:file:bg-nepal-blue/100 transition-all duration-200"
            />
            <p className="text-xs text-gray-600 mt-1">
              Requirements: JPG/PNG, max 2MB, 3:4 aspect ratio (e.g. 300x400), plain background, clear full face.
            </p>
            {imageError && (
              <p className="text-red-600 text-sm mt-1">{imageError}</p>
            )}
            {imagePreview && (
              <div className="flex items-center gap-4 mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-[120px] h-[160px] object-cover border-2 border-blue-200 rounded-xl shadow-lg"
                />
                <span className="text-gray-500 text-xs">Preview</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-blue-500 rounded-full text-base font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
            ) : null}
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}

export default GoogleCompleteProfile;


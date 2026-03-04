import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc"; // colored Google logo
import PrimaryButton from "./PrimaryButton";

/**
 * A unified "continue with Google" button that matches the rest of the
 * application's primary buttons.  Internally it uses the `useGoogleLogin`
 * hook so we can render our own element instead of the library's default
 * styled button.
 *
 * Required props:
 *  - onSuccess(credentialResponse)
 *  - onError(error)
 *
 * Optional props:
 *  - loading: boolean (shows spinner)
 *  - disabled: boolean
 */
function GoogleAuthButton({ onSuccess, onError, loading, disabled, label, variant }) {
  // variant: 'full' (default big rectangle), 'oval' (left-white+gradient), 'circle' (icon only)
  const login = useGoogleLogin({
    onSuccess,
    onError,
  });

  const isCircle = variant === 'circle';
  const isOval = variant === 'oval';

  // if oval variant we render a custom button instead of using PrimaryButton
  if (isOval) {
    const isDisabled = disabled || loading;
    return (
      <button
        onClick={() => login()}
        disabled={isDisabled}
        className={`inline-flex items-center rounded-full overflow-hidden shadow-xl transition-transform duration-150 ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-105"
        }`}
      >
        {loading && (
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white absolute left-3" />
        )}
        {/* white square with G */}
        <span className="flex items-center justify-center w-12 h-12 bg-white rounded-l-full border-r border-gray-300">
          <FcGoogle size={24} />
        </span>
        {/* gradient right section */}
        <span className="flex items-center justify-center px-6 h-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
          {label || "Continue with Google"}
        </span>
      </button>
    );
  }

  // fallback for full or circle variants
  let baseClass;
  if (isCircle) {
    baseClass = "flex items-center justify-center w-12 h-12 p-0";
  } else {
    baseClass = "w-full max-w-[320px] justify-center";
  }

  const iconWrapperClass = isCircle
    ? ""
    : "w-6 h-6 bg-white rounded-full flex items-center justify-center";

  const iconElement = (
    <span className={iconWrapperClass + (isCircle ? "" : " mr-2")}>
      <FcGoogle size={isCircle ? 20 : 24} />
    </span>
  );

  return (
    <PrimaryButton
      onClick={() => login()}
      loading={loading}
      disabled={disabled}
      className={
        baseClass +
        (isCircle ? " rounded-full bg-white border border-gray-300" : "")
      }
    >
      {iconElement}
      {!isCircle && (label || "Continue with Google")}
    </PrimaryButton>
  );
}

GoogleAuthButton.defaultProps = {
  label: null,
  variant: 'full',
};

export default GoogleAuthButton;

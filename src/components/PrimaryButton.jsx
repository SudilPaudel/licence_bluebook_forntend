import React from "react";
import PropTypes from "prop-types";

/**
 * A styled primary button used throughout the application.
 * Applies the same gradient, padding, focus and disabled styles everywhere.
 *
 * Props are forwarded to the underlying <button> element.  A spinner is
 * shown when `loading` is true and the button is automatically disabled
 * when either `loading` or `disabled` is truthy.
 */
function PrimaryButton({ children, loading, disabled, className = "", ...rest }) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`inline-flex items-center justify-center px-8 py-3 border border-blue-500 rounded-full text-base font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading && (
        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
      )}
      {children}
    </button>
  );
}

PrimaryButton.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

PrimaryButton.defaultProps = {
  loading: false,
  disabled: false,
  className: "",
};

export default PrimaryButton;

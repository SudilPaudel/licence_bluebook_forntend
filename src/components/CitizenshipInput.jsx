import React from "react";

/**
 * Nepal citizenship number input - exactly 11 numeric digits.
 * Prevents non-numeric input, restricts length to 11, shows error if invalid.
 */
function CitizenshipInput({
  value,
  onChange,
  error,
  onBlur,
  placeholder = "Enter 11-digit citizenship number",
  label,
  required = false,
  className = "",
  inputClassName = "",
  name = "citizenshipNo",
  disabled = false,
}) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
    const syntheticEvent = { target: { name, value: raw } };
    onChange(syntheticEvent);
  };

  const displayValue = typeof value === "string" ? value : value ?? "";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="block font-semibold mb-1 text-left text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        name={name}
        maxLength={11}
        required={required}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue/60 bg-white ${
          error ? "border-red-400 focus:ring-red-400/60" : "border-blue-200"
        } ${inputClassName}`}
        autoComplete="off"
      />
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default CitizenshipInput;

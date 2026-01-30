import React from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

const Notification = ({ type, message, onClose, autoClose = true, duration = 5000 }) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="mr-2 flex-shrink-0" />;
      case "error":
        return <FaExclamationCircle className="mr-2 flex-shrink-0" />;
      case "info":
        return <FaInfoCircle className="mr-2 flex-shrink-0" />;
      default:
        return <FaInfoCircle className="mr-2 flex-shrink-0" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border border-green-300";
      case "error":
        return "bg-red-100 text-red-800 border border-red-300";
      case "info":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  if (!message) return null;

  return (
    <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${getStyles()}`}>
      <div className="flex items-center">
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-gray-500 hover:text-gray-700 flex-shrink-0"
        >
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
};

export default Notification; 
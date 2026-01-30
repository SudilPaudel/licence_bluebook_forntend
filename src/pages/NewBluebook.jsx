import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaSave, FaArrowLeft, FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";

function NewBluebook() {
  // Main component for registering a new bluebook

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleRegNo: "",
    vehicleType: "",
    VehicleRegistrationDate: "",
    vehicleOwnerName: "",
    vehicleModel: "",
    manufactureYear: "",
    chasisNumber: "",
    vehicleColor: "",
    vehicleEngineCC: "",
    vehicleNumber: "",
    taxPayDate: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Checks if the user is authenticated by verifying the access token.
   * Redirects to login page if not authenticated.
   */
  const checkAuth = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  };

  /**
   * Handles input changes for form fields and clears errors for the changed field.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  /**
   * Calculates tax expire date as 1 year after tax pay date
   * @param {string} taxPayDate - The tax pay date in YYYY-MM-DD format
   * @returns {string} The calculated tax expire date in YYYY-MM-DD format
   */
  const calculateTaxExpireDate = (taxPayDate) => {
    if (!taxPayDate) return "";
    
    const payDate = new Date(taxPayDate);
    const expireDate = new Date(payDate);
    expireDate.setFullYear(payDate.getFullYear() + 1);
    
    return expireDate.toISOString().split('T')[0];
  };

  /**
   * Validates the form fields and sets error messages if validation fails.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleRegNo) newErrors.vehicleRegNo = "Vehicle registration number is required";
    if (!formData.vehicleType) newErrors.vehicleType = "Vehicle type is required";
    if (!formData.VehicleRegistrationDate) newErrors.VehicleRegistrationDate = "Vehicle registration date is required";
    if (!formData.vehicleOwnerName) newErrors.vehicleOwnerName = "Vehicle owner name is required";
    if (!formData.vehicleModel) newErrors.vehicleModel = "Vehicle model is required";
    if (!formData.manufactureYear) newErrors.manufactureYear = "Manufacture year is required";
    if (!formData.chasisNumber) newErrors.chasisNumber = "Chassis number is required";
    if (!formData.vehicleColor) newErrors.vehicleColor = "Vehicle color is required";
    if (!formData.vehicleEngineCC) newErrors.vehicleEngineCC = "Engine CC is required";
    if (!formData.vehicleNumber) newErrors.vehicleNumber = "Vehicle number is required";
    if (!formData.taxPayDate) newErrors.taxPayDate = "Tax pay date is required";

    // Validate year
    if (formData.manufactureYear) {
      const year = parseInt(formData.manufactureYear);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        newErrors.manufactureYear = "Invalid manufacture year";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission for registering a new bluebook.
   * Validates the form, sends data to the API, and manages loading and navigation.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Calculate tax expire date before sending to server
      const submissionData = {
        ...formData,
        taxExpireDate: calculateTaxExpireDate(formData.taxPayDate)
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bluebook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bluebook registered successfully!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to register bluebook');
      }
    } catch (error) {
      console.error('Error registering bluebook:', error);
      toast.error('An error occurred while registering the bluebook');
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = [
    "Motorcycle",
    "Car"
  ];

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-2 p-2 rounded-full bg-white shadow hover:bg-nepal-blue/10 transition-all duration-200"
              >
                <FaArrowLeft className="h-5 w-5 text-nepal-blue" />
              </button>
              <div>
                <h1 className="text-4xl font-extrabold text-nepal-blue tracking-tight animate-slide-down">
                  Register New Bluebook
                </h1>
                <p className="mt-1 text-base text-gray-600 animate-fade-in delay-100">
                  Enter vehicle details for bluebook registration
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <FaCar className="h-10 w-10 text-nepal-blue drop-shadow-lg animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/90 shadow-2xl backdrop-blur-md ring-1 ring-nepal-blue/20 overflow-hidden sm:rounded-2xl animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {/* Vehicle Information */}
            <div>
              <h3 className="text-xl font-semibold text-nepal-blue mb-6 border-l-4 border-nepal-blue pl-3 animate-slide-right text-left">
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Vehicle Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleRegNo"
                    value={formData.vehicleRegNo}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.vehicleRegNo ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="Enter registration number"
                  />
                  {errors.vehicleRegNo && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicleRegNo}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.vehicleType ? 'border-red-400' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.vehicleType && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicleType}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Vehicle Registration Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="VehicleRegistrationDate"
                    value={formData.VehicleRegistrationDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.VehicleRegistrationDate ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.VehicleRegistrationDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.VehicleRegistrationDate}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Vehicle Owner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleOwnerName"
                    value={formData.vehicleOwnerName}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.vehicleOwnerName ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="Enter owner name"
                  />
                  {errors.vehicleOwnerName && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicleOwnerName}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Vehicle Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.vehicleModel ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g., Honda City, Toyota Corolla"
                  />
                  {errors.vehicleModel && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicleModel}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Manufacture Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="manufactureYear"
                    value={formData.manufactureYear}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.manufactureYear ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.manufactureYear && (
                    <p className="mt-1 text-xs text-red-500">{errors.manufactureYear}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Chassis Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="chasisNumber"
                    value={formData.chasisNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.chasisNumber ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="Enter chassis number"
                  />
                  {errors.chasisNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.chasisNumber}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Vehicle Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleColor"
                    value={formData.vehicleColor}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.vehicleColor ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="Enter vehicle color"
                  />
                  {errors.vehicleColor && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicleColor}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Engine CC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="vehicleEngineCC"
                    value={formData.vehicleEngineCC}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.vehicleEngineCC ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g., 1500"
                    min="50"
                    max="10000"
                  />
                  {errors.vehicleEngineCC && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicleEngineCC}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.vehicleNumber ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g., Ba 1 Pa 1234"
                  />
                  {errors.vehicleNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicleNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div>
              <h3 className="text-xl font-semibold text-nepal-blue mb-6 border-l-4 border-nepal-blue pl-3 animate-slide-right text-left">
                Tax Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Tax Pay Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="taxPayDate"
                    value={formData.taxPayDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nepal-blue transition-all duration-200 ${
                      errors.taxPayDate ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.taxPayDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.taxPayDate}</p>
                  )}
                </div>

                <div className="transition-all duration-200 hover:scale-[1.02]">
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">
                    Tax Expire Date (Auto-calculated)
                  </label>
                  <div className="mt-1 block w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 border-gray-200">
                    {formData.taxPayDate ? calculateTaxExpireDate(formData.taxPayDate) : 'Will be calculated automatically'}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Tax expire date will be automatically set to 1 year after the tax pay date</p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-3 border border-blue-500 rounded-full text-base font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-3 text-lg" />
                    Register Bluebook
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
          .animate-fade-in { animation: fadeIn 0.7s ease; }
          .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(.39,.575,.565,1.000); }
          .animate-slide-down { animation: slideDown 0.7s cubic-bezier(.39,.575,.565,1.000); }
          .animate-slide-right { animation: slideRight 0.7s cubic-bezier(.39,.575,.565,1.000); }
          .animate-bounce-slow { animation: bounceSlow 2.5s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none;} }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: none;} }
          @keyframes slideRight { from { opacity: 0; transform: translateX(-30px);} to { opacity: 1; transform: none;} }
          @keyframes bounceSlow {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </div>
  );
}

export default NewBluebook;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCreditCard, FaShieldAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaCalculator, FaReceipt } from "react-icons/fa";
import khaltiLogo from "../assets/khalti.png";
import { useLang } from "../context/LanguageContext";
import { paymentLabels } from "../labels/paymentLabels";

// Khalti Logo Component using PNG
/**
 * Renders the Khalti logo image.
 * @param {object} props
 */
const KhaltiLogo = ({ className = "h-8 w-8" }) => (
  <img src={khaltiLogo} alt="Khalti" className={className} />
);

function Payment() {
  // Main component for handling vehicle tax payment

  const { id } = useParams();
  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [bluebook, setBluebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('khalti');
  const [taxDetails, setTaxDetails] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  useEffect(() => {
    fetchBluebookDetail();
  }, [id]);

  /**
   * Fetches bluebook details from the API and calculates tax details.
   */
  const fetchBluebookDetail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bluebook/fetch/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setBluebook(data.result);
        calculateTaxDetails(data.result);
      } else {
        setError(data.message || 'Failed to fetch bluebook details');
      }
    } catch (error) {
      console.error('Error fetching bluebook:', error);
      setError('An error occurred while fetching bluebook details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculates tax, renewal charge, fine, and old vehicle tax based on bluebook data.
   * @param {object} bluebookData
   */
  const calculateTaxDetails = (bluebookData) => {
    const now = new Date();
    const taxExpireDate = new Date(bluebookData.taxExpireDate);
    const diffInMs = taxExpireDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    let baseTax = 0;
    let renewalCharge = 0;
    let fineAmount = 0;
    let oldVehicleTax = 0;

    // Calculate base tax based on vehicle type and engine CC
    if (bluebookData.vehicleType === "Motorcycle") {
      renewalCharge = 300;
      if (bluebookData.vehicleEngineCC <= 125) {
        baseTax = 3000;
      } else if (bluebookData.vehicleEngineCC <= 150) {
        baseTax = 5000;
      } else if (bluebookData.vehicleEngineCC <= 225) {
        baseTax = 6500;
      } else if (bluebookData.vehicleEngineCC <= 400) {
        baseTax = 12000;
      } else if (bluebookData.vehicleEngineCC <= 650) {
        baseTax = 25000;
      } else {
        baseTax = 3600;
      }
    } else if (bluebookData.vehicleType === "Car") {
      renewalCharge = 500;
      if (bluebookData.vehicleEngineCC <= 1000) {
        baseTax = 22000;
      } else if (bluebookData.vehicleEngineCC <= 1500) {
        baseTax = 25000;
      } else if (bluebookData.vehicleEngineCC <= 2000) {
        baseTax = 27000;
      } else if (bluebookData.vehicleEngineCC <= 2500) {
        baseTax = 37000;
      } else if (bluebookData.vehicleEngineCC <= 3000) {
        baseTax = 50000;
      } else if (bluebookData.vehicleEngineCC <= 3500) {
        baseTax = 65000;
      } else if (bluebookData.vehicleEngineCC >= 3501) {
        baseTax = 70000;
      }
    }

    // Calculate fine if expired
    if (daysLeft < 1) {
      if (daysLeft <= -365) {
        fineAmount = 0.20 * baseTax;
      } else if (daysLeft <= -45) {
        fineAmount = 0.10 * baseTax;
      } else if (daysLeft <= -1) {
        fineAmount = 0.05 * baseTax;
      }
    }

    // Calculate old vehicle tax (10% for vehicles 15+ years old)
    const today = new Date();
    const registrationDate = new Date(bluebookData.VehicleRegistrationDate);
    const vehicleAgeInYears = today.getFullYear() - registrationDate.getFullYear();
    
    if (vehicleAgeInYears >= 15) {
      oldVehicleTax = 0.10 * (baseTax + renewalCharge + fineAmount);
    }

    const totalTaxAmount = baseTax + renewalCharge + fineAmount + oldVehicleTax;

    setTaxDetails({
      baseTax,
      renewalCharge,
      fineAmount,
      oldVehicleTax,
      totalTaxAmount,
      daysLeft,
      vehicleAgeInYears,
      canPay: daysLeft < 30
    });
  };

  /**
   * Handles the payment initiation process.
   * Sends payment request to API and manages OTP modal.
   */
  const handlePayment = async () => {
    if (!taxDetails.canPay) {
      setError('Tax payment is not due yet. You can pay when there are less than 30 days remaining.');
      return;
    }

    // Prevent multiple clicks
    if (paymentLoading) {
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/bluebook/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod
        })
      });

      const data = await response.json();

      if (response.status === 200) {
        // Store payment ID for OTP verification
        setCurrentPaymentId(data.result.paymentData._id);
        setPaymentUrl(data.payment.paymentURl);
        setShowOtpModal(true); // Show OTP modal instead of payment modal
      } else {
        // Handle specific error messages
        let errorMessage = 'Failed to initiate payment';
        if (data.message) {
          if (data.message.includes('already have a pending payment')) {
            errorMessage = 'You already have a payment in progress. Please complete or wait a few minutes before trying again.';
          } else if (data.message.includes('not verified')) {
            errorMessage = 'Your bluebook needs to be verified by admin before you can pay tax.';
          } else if (data.message.includes('time to pay')) {
            errorMessage = 'Tax payment is not due yet. You can pay when there are less than 30 days remaining.';
          } else {
            errorMessage = data.message;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Network error. Please check your internet connection and try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  /**
   * Handles OTP verification for payment.
   * Sends OTP and payment ID to API and manages payment modal.
   */
  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/verify-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: currentPaymentId,
          otp: otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpModal(false);
        setShowPaymentModal(true); // Now show the payment modal
        setOtp('');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  /**
   * Formats a date string into a readable format.
   * @param {string} dateString
   * @returns {string}
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Returns status object for days left (color, icon, text).
   * @param {number} daysLeft
   * @returns {{color: string, icon: JSX.Element, text: string}}
   */
  const getDaysLeftStatus = (daysLeft) => {
    if (daysLeft > 30) {
      return { color: 'text-green-600', icon: <FaCheckCircle />, text: getLabel(paymentLabels.taxIsValid) };
    } else if (daysLeft > 0) {
      return { color: 'text-yellow-600', icon: <FaClock />, text: `${daysLeft} ${getLabel(paymentLabels.daysLeft)}` };
    } else {
      return { color: 'text-red-600', icon: <FaExclamationTriangle />, text: `${Math.abs(daysLeft)} ${getLabel(paymentLabels.daysExpired)}` };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nepal-blue"></div>
      </div>
    );
  }

  if (error && !bluebook) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{getLabel(paymentLabels.errorTitle)}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bluebook) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{getLabel(paymentLabels.bluebookNotFound)}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{getLabel(paymentLabels.bluebookNotFoundMessage)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 rounded-full bg-white shadow hover:shadow-lg transition-all duration-200 text-gray-400 hover:text-nepal-blue hover:bg-blue-50"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight animate-fade-in">
                  {getLabel(paymentLabels.vehicleTaxPayment)}
                </h1>
                <p className="mt-1 text-base text-gray-500 animate-fade-in-slow">
                  {getLabel(paymentLabels.payOnlineSecurely)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FaReceipt className="h-10 w-10 text-nepal-blue animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow animate-fade-in">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-base font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up">
          {/* Vehicle Information */}
          <div className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up">
            <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-xl leading-7 font-semibold text-gray-900 flex items-center">
                <FaCreditCard className="mr-2 text-nepal-blue" />
                {getLabel(paymentLabels.vehicleInformation)}
              </h3>
            </div>
            <div className="border-t border-gray-100">
              <dl>
                <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-500">{getLabel(paymentLabels.registrationNumber)}</dt>
                  <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2 font-bold tracking-wide">{bluebook.vehicleRegNo}</dd>
                </div>
                <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-500">{getLabel(paymentLabels.vehicleType)}</dt>
                  <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">{bluebook.vehicleType}</dd>
                </div>
                <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-500">{getLabel(paymentLabels.engineCC)}</dt>
                  <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">{bluebook.vehicleEngineCC} cc</dd>
                </div>
                <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-500">{getLabel(paymentLabels.ownerName)}</dt>
                  <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">{bluebook.vehicleOwnerName}</dd>
                </div>
                <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-500">{getLabel(paymentLabels.taxExpireDate)}</dt>
                  <dd className="mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(bluebook.taxExpireDate)}</dd>
                </div>
                <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-semibold text-gray-500">{getLabel(paymentLabels.status)}</dt>
                  <dd className="mt-1 text-base sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-base font-semibold shadow-sm transition-all duration-200 ${getDaysLeftStatus(taxDetails?.daysLeft || 0).color.replace('text-', 'bg-').replace('-600', '-200')} ${getDaysLeftStatus(taxDetails?.daysLeft || 0).color} animate-pulse`}>
                      {getDaysLeftStatus(taxDetails?.daysLeft || 0).icon}
                      <span className="ml-2">{getDaysLeftStatus(taxDetails?.daysLeft || 0).text}</span>
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Tax Calculation */}
          <div className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up delay-100">
            <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="text-xl leading-7 font-semibold text-gray-900 flex items-center">
                <FaCalculator className="mr-2 text-purple-500" />
                {getLabel(paymentLabels.taxCalculation)}
              </h3>
            </div>
            <div className="border-t border-gray-100">
              {taxDetails ? (
                <div className="px-6 py-6">
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600">{getLabel(paymentLabels.baseTax)}</span>
                      <span className="text-base font-semibold">Rs. {taxDetails.baseTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-600">{getLabel(paymentLabels.renewalCharge)}</span>
                      <span className="text-base font-semibold">Rs. {taxDetails.renewalCharge.toLocaleString()}</span>
                    </div>
                    {taxDetails.fineAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-base text-red-600 font-medium">{getLabel(paymentLabels.fineAmount)}</span>
                        <span className="text-base font-semibold text-red-600">Rs. {taxDetails.fineAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {taxDetails.oldVehicleTax > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-base text-orange-600 font-medium">{getLabel(paymentLabels.oldVehicleTax)}</span>
                        <span className="text-base font-semibold text-orange-600">Rs. {taxDetails.oldVehicleTax.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-dashed border-gray-300 pt-5">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">{getLabel(paymentLabels.totalAmount)}</span>
                        <span className="text-xl font-extrabold text-nepal-blue animate-fade-in">{`Rs. ${taxDetails.totalTaxAmount.toLocaleString()}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mt-8">
                    <h4 className="text-base font-semibold text-gray-900 mb-3">{getLabel(paymentLabels.paymentMethod)}</h4>
                    <div className="flex space-x-4">
                      <div className="flex items-center p-4 border-2 border-nepal-blue bg-blue-50 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer">
                        <KhaltiLogo className="h-10 w-10" />
                        <span className="ml-3 text-lg font-bold text-nepal-blue">{getLabel(paymentLabels.khalti)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <div className="mt-8">
                    {taxDetails.canPay ? (
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="w-full bg-gradient-to-r from-nepal-blue to-purple-500 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white font-extrabold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center text-lg tracking-wide animate-fade-in"
                      >
                        {paymentLoading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <>
                            {getLabel(paymentLabels.payAmount)} Rs. {taxDetails.totalTaxAmount.toLocaleString()}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-base text-gray-500 font-medium animate-fade-in-slow">
                          {getLabel(paymentLabels.taxNotDueMessage)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="relative mx-auto p-8 w-full max-w-md shadow-2xl rounded-2xl bg-white border border-blue-100 animate-scale-in">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <KhaltiLogo className="h-14 w-14 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{getLabel(paymentLabels.enterOtp)}</h3>
                <p className="text-base text-gray-500 mb-5">
                  {getLabel(paymentLabels.otpSentToEmail)}
                </p>
                
                {error && (
                  <div className="mb-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg animate-fade-in">
                    <p className="text-base">{error}</p>
                  </div>
                )}

                <div className="mb-6">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={getLabel(paymentLabels.enter6DigitOtp)}
                    className="w-full px-4 py-3 border-2 border-nepal-blue rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-center text-xl font-mono tracking-widest transition-all duration-200"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleOtpVerification}
                    disabled={otpLoading || otp.length !== 6}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow transition-all duration-200 flex items-center justify-center"
                  >
                    {otpLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      getLabel(paymentLabels.verifyOtp)
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowOtpModal(false);
                      setOtp('');
                      setError(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl shadow"
                  >
                    {getLabel(paymentLabels.cancel)}
                  </button>
                </div>
                <div className="mt-5 text-xs text-gray-400">
                  {getLabel(paymentLabels.didntReceiveOtp)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && paymentUrl && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="relative mx-auto p-8 w-full max-w-md shadow-2xl rounded-2xl bg-white border border-purple-100 animate-scale-in">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <KhaltiLogo className="h-14 w-14 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{getLabel(paymentLabels.completePayment)}</h3>
                <p className="text-base text-gray-500 mb-5">
                  {getLabel(paymentLabels.paymentConfirmed)}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open(paymentUrl, '_blank')}
                    className="flex-1 bg-gradient-to-r from-nepal-blue to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow transition-all duration-200 flex items-center justify-center"
                  >
                    <KhaltiLogo className="h-5 w-5 mr-2" />
                    {getLabel(paymentLabels.proceedToPayment)}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl shadow"
                  >
                    {getLabel(paymentLabels.cancel)}
                  </button>
                </div>
                <div className="mt-5 text-xs text-gray-400">
                  {getLabel(paymentLabels.afterPaymentVerify)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 1s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-fade-in-slow {
            animation: fadeIn 1.5s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-fade-in-up {
            animation: fadeInUp 1s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-fade-in-fast {
            animation: fadeIn 0.3s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-scale-in {
            animation: scaleIn 0.5s cubic-bezier(.4,0,.2,1) both;
          }
          .animate-bounce-slow {
            animation: bounce 2.5s infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.85);}
            to { opacity: 1; transform: scale(1);}
          }
        `}
      </style>
    </div>
  );
}

export default Payment;
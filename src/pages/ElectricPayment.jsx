import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCreditCard, FaShieldAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaCalculator, FaReceipt, FaBatteryFull } from "react-icons/fa";
import khaltiLogo from "../assets/khalti.png";
import { useLang } from "../context/LanguageContext";
import { electricLabels } from "../labels/electricLabels";

// Khalti Logo Component using PNG
/**
 * Renders the Khalti logo image.
 * @param {object} props
 */
const KhaltiLogo = ({ className = "h-8 w-8" }) => (
  <img src={khaltiLogo} alt="Khalti" className={className} />
);

function ElectricPayment() {
  // Main component for handling electric vehicle tax payment

  const { id } = useParams();
  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [electricBluebook, setElectricBluebook] = useState(null);
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
    fetchElectricBluebookDetail();
  }, [id]);

  /**
   * Fetches electric bluebook details from the API and calculates tax details.
   */
  const fetchElectricBluebookDetail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/electric-bluebook/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          setElectricBluebook(data.result);
          calculateTaxDetails(data.result);
        } else {
          setError('Electric bluebook not found');
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.message || 'Failed to fetch electric bluebook details');
      }
    } catch (error) {
      console.error('Error fetching electric bluebook:', error);
      setError('Network error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculates tax details based on electric bluebook information.
   */
  const calculateTaxDetails = (bluebook) => {
    if (!bluebook || !bluebook.taxExpireDate) {
      setError('Invalid electric bluebook data');
      return;
    }
    
    const now = new Date();
    const taxExpireDate = new Date(bluebook.taxExpireDate);
    const diffInMs = taxExpireDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    let baseTax = 0;
    let renewalCharge = 0;

    // Calculate tax based on vehicle type and battery capacity
    
          if (bluebook.vehicleType === "Motorcycle" || bluebook.vehicleType === "motorcycle" || bluebook.vehicleType === "MC") {
      renewalCharge = 300;
      const batteryCapacity = Number(bluebook.vehicleBatteryCapacity || 0);

      
      if (batteryCapacity <= 50) {
        baseTax = 1000;
      } else if (batteryCapacity <= 350) {
        baseTax = 1500;
      } else if (batteryCapacity <= 1000) {
        baseTax = 2000;
      } else if (batteryCapacity <= 1500) {
        baseTax = 2500;
      } else {
        baseTax = 3000; // 1501 and higher
      }

          } else if (bluebook.vehicleType === "Car" || bluebook.vehicleType === "car" || bluebook.vehicleType === "CAR") {
      renewalCharge = 500;
      const batteryCapacity = Number(bluebook.vehicleBatteryCapacity || 0);

      
      if (batteryCapacity <= 10) {
        baseTax = 5000;
      } else if (batteryCapacity <= 50) {
        baseTax = 5000;
      } else if (batteryCapacity <= 125) {
        baseTax = 15000;
      } else if (batteryCapacity <= 200) {
        baseTax = 20000;
      } else {
        baseTax = 30000; // 201 and higher
      }

    } else {

              // Default to Motorcycle if unknown
      renewalCharge = 300;
      const batteryCapacity = Number(bluebook.vehicleBatteryCapacity || 0);
      if (batteryCapacity <= 50) {
        baseTax = 1000;
      } else if (batteryCapacity <= 350) {
        baseTax = 1500;
      } else if (batteryCapacity <= 1000) {
        baseTax = 2000;
      } else if (batteryCapacity <= 1500) {
        baseTax = 2500;
      } else {
        baseTax = 3000;
      }

    }

    let fineAmount = 0;
    if (daysLeft < 0) {
      if (daysLeft <= -365) {
        fineAmount = 0.2 * baseTax;
      } else if (daysLeft <= -45) {
        fineAmount = 0.1 * baseTax;
      } else if (daysLeft <= -1) {
        fineAmount = 0.05 * baseTax;
      }
    }

    const totalTax = baseTax + renewalCharge + fineAmount;
    


    setTaxDetails({
      baseTax,
      renewalCharge,
      fineAmount,
      totalTax,
      daysLeft,
      isExpired: daysLeft < 0,
      isDueSoon: daysLeft <= 30 && daysLeft > 0
    });
  };

  /**
   * Initiates the electric payment process.
   */
  const initiatePayment = async () => {
    try {
      setPaymentLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/electric-payment/electric-bluebook/${id}`, {
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

      if (response.ok) {
        // Store payment ID for OTP verification
        setCurrentPaymentId(data.result.paymentData._id);
        setShowOtpModal(true); // Show OTP modal instead of payment modal
      } else {
        setError(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Network error. Please check your internet connection.');
    } finally {
      setPaymentLoading(false);
    }
  };

  /**
   * Initiates Khalti payment after OTP verification.
   */
  const initiateKhaltiPayment = async () => {
    try {
      setPaymentLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/electric-payment/initiate-khalti`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId: currentPaymentId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentUrl(data.payment.paymentURl);
        setShowPaymentModal(true); // Now show the payment modal
      } else {
        setError(data.message || 'Failed to initiate Khalti payment');
      }
    } catch (error) {
      console.error('Error initiating Khalti payment:', error);
      setError('Network error. Please check your internet connection.');
    } finally {
      setPaymentLoading(false);
    }
  };

  /**
   * Verifies OTP for payment confirmation.
   */
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/electric-payment/verify-otp`, {
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
        setOtp('');
        // Now proceed to Khalti payment
        await initiateKhaltiPayment();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nepal-blue"></div>
      </div>
    );
  }

  if (error && !electricBluebook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getLabel(electricLabels.error)}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-nepal-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {getLabel(electricLabels.backToDashboard)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 border border-emerald-100"
            >
              <FaArrowLeft className="h-6 w-6 text-emerald-600" />
            </button>
            <div className="space-y-2">
              <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {getLabel(electricLabels.electricVehicleTaxPayment)}
              </h1>
              <p className="text-xl text-gray-600 font-medium">{getLabel(electricLabels.completePaymentSecurely)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Electric Bluebook Details */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-emerald-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
                <FaBatteryFull className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {getLabel(electricLabels.electricBluebookDetails)}
              </h2>
            </div>
            
            {electricBluebook && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                    <label className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{getLabel(electricLabels.vehicleNumber)}</label>
                    <p className="text-xl font-bold text-gray-900 mt-1">{electricBluebook.vehicleNumber}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                    <label className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{getLabel(electricLabels.vehicleType)}</label>
                    <p className="text-xl font-bold text-gray-900 mt-1">{electricBluebook.vehicleType}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                    <label className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{getLabel(electricLabels.batteryCapacity)}</label>
                    <p className="text-xl font-bold text-gray-900 mt-1">{electricBluebook.vehicleBatteryCapacity} {electricBluebook.vehicleType === "Motorcycle" ? "W" : "KW"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                    <label className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{getLabel(electricLabels.ownerName)}</label>
                    <p className="text-xl font-bold text-gray-900 mt-1">{electricBluebook.vehicleOwnerName}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500 rounded-xl">
                      <FaClock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">{getLabel(electricLabels.taxExpiryDate)}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {new Date(electricBluebook.taxExpireDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tax Calculation & Payment */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-emerald-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                <FaCalculator className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {getLabel(electricLabels.taxCalculation)}
              </h2>
            </div>

            {taxDetails && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-blue-700 font-semibold">{getLabel(electricLabels.baseTax)}:</span>
                      <span className="text-xl font-bold text-gray-900">Rs. {taxDetails.baseTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-blue-700 font-semibold">{getLabel(electricLabels.renewalCharge)}:</span>
                      <span className="text-xl font-bold text-gray-900">Rs. {taxDetails.renewalCharge.toLocaleString()}</span>
                    </div>
                    {taxDetails.fineAmount > 0 && (
                      <div className="flex justify-between items-center py-2 text-red-600">
                        <span className="font-semibold">{getLabel(electricLabels.fineAmount)}:</span>
                        <span className="text-xl font-bold">Rs. {taxDetails.fineAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-blue-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-800">{getLabel(electricLabels.totalAmount)}:</span>
                        <span className="text-3xl font-black text-gray-900">Rs. {taxDetails.totalTax.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                {taxDetails.isExpired && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 font-semibold">{getLabel(electricLabels.taxExpired)}</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">
                      {getLabel(electricLabels.taxExpiredDaysAgo).replace('{days}', Math.abs(taxDetails.daysLeft))}
                    </p>
                  </div>
                )}

                {taxDetails.isDueSoon && !taxDetails.isExpired && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <FaClock className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-700 font-semibold">{getLabel(electricLabels.dueSoon)}</span>
                    </div>
                    <p className="text-yellow-600 text-sm mt-1">
                      {getLabel(electricLabels.taxExpiresInDays).replace('{days}', taxDetails.daysLeft)}
                    </p>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">{getLabel(electricLabels.paymentMethod)}</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="khalti"
                        checked={paymentMethod === 'khalti'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <KhaltiLogo className="h-6 w-6" />
                      <span className="font-medium">Khalti</span>
                    </label>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={initiatePayment}
                  disabled={paymentLoading}
                  className="w-full bg-gradient-to-r from-nepal-blue to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {paymentLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {getLabel(electricLabels.processing)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FaCreditCard className="w-5 h-5" />
                      {getLabel(electricLabels.pay)} Rs. {taxDetails.totalTax.toLocaleString()}
                    </div>
                  )}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <FaExclamationTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700 font-semibold">{getLabel(electricLabels.error)}</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && paymentUrl && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="relative mx-auto p-8 w-full max-w-md shadow-2xl rounded-2xl bg-white border border-purple-100 animate-scale-in">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <KhaltiLogo className="h-14 w-14 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{getLabel(electricLabels.completeElectricPayment)}</h3>
                <p className="text-base text-gray-500 mb-5">
                  {getLabel(electricLabels.paymentConfirmedRedirect)}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open(paymentUrl, '_blank')}
                    className="flex-1 bg-gradient-to-r from-nepal-blue to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow transition-all duration-200 flex items-center justify-center"
                  >
                    <KhaltiLogo className="h-5 w-5 mr-2" />
                    {getLabel(electricLabels.proceedToPayment)}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl shadow"
                  >
                    {getLabel(electricLabels.cancel)}
                  </button>
                </div>
                <div className="mt-5 text-xs text-gray-400">
                  {getLabel(electricLabels.paymentVerifyNote)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTP Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{getLabel(electricLabels.enterOtp)}</h3>
              <p className="text-gray-600 mb-6">
                {getLabel(electricLabels.enterOtpDescription)}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={getLabel(electricLabels.enter6DigitOtp)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-center text-lg font-mono"
                maxLength={6}
              />
              <div className="flex space-x-3">
                <button
                  onClick={verifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                  className="flex-1 bg-nepal-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? getLabel(electricLabels.verifying) : getLabel(electricLabels.verifyOtp)}
                </button>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300"
                >
                  {getLabel(electricLabels.cancel)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fade-in-fast {
            animation: fadeIn 0.2s ease-out;
          }
          
          .animate-scale-in {
            animation: scaleIn 0.3s ease-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default ElectricPayment; 
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft } from "react-icons/fa";
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

function ElectricPaymentVerification() {
  // Main component for verifying electric vehicle payment status

  const { id } = useParams();
  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    verifyElectricPayment();
  }, []);

  /**
   * Verifies the electric payment by sending the transaction ID (pidx) to the backend.
   * Updates verification status and error messages based on response.
   */
  const verifyElectricPayment = async () => {
    try {
      const pidx = searchParams.get('pidx');
      
      if (!pidx) {
        setVerificationStatus('failed');
        setError('Electric payment verification failed: Missing transaction ID');
        return;
      }

      if (!id) {
        setVerificationStatus('failed');
        setError('Electric payment verification failed: Missing electric bluebook ID');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/electric-payment/verify/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pidx })
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setVerificationData(data.result);
      } else {
        setVerificationStatus('failed');
        // Handle specific error messages
        let errorMessage = 'Electric payment verification failed';
        if (data.message) {
          if (data.message.includes('pidx')) {
            errorMessage = 'Electric payment verification failed: Missing transaction details. Please try again.';
          } else if (data.message.includes('not verified')) {
            errorMessage = 'Electric payment was not completed. Please try the payment again.';
          } else {
            errorMessage = data.message;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error verifying electric payment:', error);
      setVerificationStatus('failed');
      setError('Network error. Please check your internet connection and try again.');
    }
  };

  /**
   * Handles navigation back to the dashboard.
   */
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  /**
   * Handles retrying the payment verification process.
   * Resets status and error, then calls verifyElectricPayment again.
   */
  const handleRetry = () => {
    setVerificationStatus('verifying');
    setError(null);
    verifyElectricPayment();
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nepal-blue mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getLabel(electricLabels.verifyingElectricPayment)}</h2>
          <p className="text-gray-600">{getLabel(electricLabels.pleaseWaitVerifying)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-full bg-white shadow hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <FaArrowLeft className="h-5 w-5 text-blue-500" />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{getLabel(electricLabels.electricPaymentVerification)}</h1>
              <p className="mt-1 text-base text-gray-500">{getLabel(electricLabels.seePaymentStatus)}</p>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        <div className="bg-white/80 shadow-xl backdrop-blur-md border border-gray-100 rounded-3xl overflow-hidden animate-fade-in-up">
          {verificationStatus === 'success' ? (
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{getLabel(electricLabels.paymentSuccessful)}</h2>
              <p className="text-lg text-gray-600 mb-6">
                {getLabel(electricLabels.paymentVerifiedProcessed)}
              </p>
              
              {verificationData && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{getLabel(electricLabels.paymentDetails)}</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getLabel(electricLabels.totalAmount)}:</span>
                      <span className="font-semibold">Rs. {verificationData.totalAmount?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getLabel(electricLabels.transactionId)}:</span>
                      <span className="font-mono text-sm">{verificationData.transactionId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getLabel(electricLabels.fee)}:</span>
                      <span className="font-semibold">Rs. {verificationData.fee || 0}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBackToDashboard}
                  className="flex-1 bg-gradient-to-r from-nepal-blue to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {getLabel(electricLabels.backToDashboard)}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTimesCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{getLabel(electricLabels.paymentVerificationFailed)}</h2>
              <p className="text-lg text-gray-600 mb-6">
                {error || getLabel(electricLabels.paymentIssue)}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r from-nepal-blue to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {getLabel(electricLabels.tryAgain)}
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl shadow transition-all duration-200"
                >
                  {getLabel(electricLabels.backToDashboard)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {getLabel(electricLabels.poweredByKhalti)}
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default ElectricPaymentVerification; 
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft } from "react-icons/fa";
import khaltiLogo from "../assets/khalti.png";
import { useLang } from "../context/LanguageContext";
import { paymentVerificationLabels } from "../labels/paymentVerificationLabels";

// Khalti Logo Component using PNG
/**
 * Renders the Khalti logo image.
 * @param {object} props
 */
const KhaltiLogo = ({ className = "h-8 w-8" }) => (
  <img src={khaltiLogo} alt="Khalti" className={className} />
);

function PaymentVerification() {
  // Main component for verifying payment status
  const { getLabel } = useLang();

  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  /**
   * Verifies the payment by sending the transaction ID (pidx) to the backend.
   * Updates verification status and error messages based on response.
   */
  const verifyPayment = async () => {
    try {
      const pidx = searchParams.get('pidx');
      if (!pidx) {
        setVerificationStatus('failed');
        setError(getLabel(paymentVerificationLabels.missingTransactionId));
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/verify/${id}`, {
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
        let errorMessage = 'Payment verification failed';
        if (data.message) {
          if (data.message.includes('pidx')) {
            errorMessage = 'Payment verification failed: Missing transaction details. Please try again.';
          } else if (data.message.includes('not verified')) {
            errorMessage = 'Payment was not completed. Please try the payment again.';
          } else {
            errorMessage = data.message;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerificationStatus('failed');
      setError(getLabel(paymentVerificationLabels.networkError));
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
   * Resets status and error, then calls verifyPayment again.
   */
  const handleRetry = () => {
    setVerificationStatus('verifying');
    setError(null);
    verifyPayment();
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-nepal-blue mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getLabel(paymentVerificationLabels.verifyingPaymentTitle)}</h2>
          <p className="text-gray-600">{getLabel(paymentVerificationLabels.verifyingPaymentWait)}</p>
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
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">{getLabel(paymentVerificationLabels.paymentVerification)}</h1>
              <p className="mt-1 text-base text-gray-500">{getLabel(paymentVerificationLabels.paymentStatusSubtitle)}</p>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        <div className="bg-white/80 shadow-xl backdrop-blur-md border border-gray-100 rounded-3xl overflow-hidden animate-fade-in-up">
          <div className="px-6 py-7 sm:px-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {verificationStatus === 'success' ? (
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="h-10 w-10 text-green-500 animate-bounce" />
                  <KhaltiLogo className="h-7 w-7 mr-1 drop-shadow" />
                </div>
              ) : (
                <FaTimesCircle className="h-10 w-10 text-red-500 animate-shake" />
              )}
              <h3 className="text-2xl font-semibold text-gray-900">
                {verificationStatus === 'success' ? getLabel(paymentVerificationLabels.paymentSuccessful) : getLabel(paymentVerificationLabels.paymentFailed)}
              </h3>
            </div>
          </div>

          <div className="border-t border-gray-100">
            {verificationStatus === 'success' ? (
              <div className="px-6 py-8 sm:px-8">
                <div className="bg-gradient-to-r from-green-100 via-green-50 to-green-200 border border-green-200 rounded-xl p-5 mb-8 shadow-inner animate-fade-in">
                  <div className="flex items-center gap-4">
                    <FaCheckCircle className="h-6 w-6 text-green-400 animate-pulse" />
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-green-800">{getLabel(paymentVerificationLabels.paymentVerifiedSuccess)}</h4>
                      <p className="text-sm text-green-700 mt-1">
                        {getLabel(paymentVerificationLabels.vehicleTaxRenewed)}
                      </p>
                    </div>
                    <KhaltiLogo className="h-10 w-10" />
                  </div>
                </div>

                {verificationData && (
                  <div className="space-y-5">
                    <h4 className="text-lg font-semibold text-gray-900">{getLabel(paymentVerificationLabels.transactionDetails)}</h4>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                      <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{getLabel(paymentVerificationLabels.totalAmount)}</dt>
                        <dd className="mt-1 text-lg font-bold text-gray-900">Rs. {verificationData.totalAmount?.toLocaleString()}</dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{getLabel(paymentVerificationLabels.transactionId)}</dt>
                        <dd className="mt-1 text-lg font-mono text-gray-900">{verificationData.transactionId}</dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{getLabel(paymentVerificationLabels.fee)}</dt>
                        <dd className="mt-1 text-lg font-bold text-gray-900">Rs. {verificationData.fee?.toLocaleString()}</dd>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{getLabel(paymentVerificationLabels.refunded)}</dt>
                        <dd className="mt-1 text-lg font-bold text-gray-900">{verificationData.refunded ? getLabel(paymentVerificationLabels.yes) : getLabel(paymentVerificationLabels.no)}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                <div className="mt-10">
                  <button
                    onClick={handleBackToDashboard}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 text-lg tracking-wide"
                  >
                    {getLabel(paymentVerificationLabels.backToDashboard)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <div className="bg-gradient-to-r from-red-100 via-red-50 to-red-200 border border-red-200 rounded-xl p-5 mb-8 shadow-inner animate-fade-in">
                  <div className="flex items-center gap-4">
                    <FaTimesCircle className="h-6 w-6 text-red-400 animate-shake" />
                    <div>
                      <h4 className="text-base font-semibold text-red-800">{getLabel(paymentVerificationLabels.paymentFailed)}</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {error || getLabel(paymentVerificationLabels.unableToVerify)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">{getLabel(paymentVerificationLabels.whatToDoNext)}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      {getLabel(paymentVerificationLabels.checkKhaltiPayment)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                      {getLabel(paymentVerificationLabels.waitAndTryAgain)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {getLabel(paymentVerificationLabels.contactSupport)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                      {getLabel(paymentVerificationLabels.sufficientBalance)}
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 text-lg tracking-wide flex items-center justify-center gap-2"
                  >
                    <FaSpinner className="animate-spin" />
                    {getLabel(paymentVerificationLabels.tryAgain)}
                  </button>
                  <button
                    onClick={handleBackToDashboard}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl shadow transition-all duration-200 text-lg tracking-wide"
                  >
                    {getLabel(paymentVerificationLabels.backToDashboard)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
          }
          @keyframes fade-in {
            0% { opacity: 0;}
            100% { opacity: 1;}
          }
          .animate-fade-in {
            animation: fade-in 1s ease both;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0);}
            20%, 60% { transform: translateX(-6px);}
            40%, 80% { transform: translateX(6px);}
          }
          .animate-shake {
            animation: shake 0.5s;
          }
        `}
      </style>
    </div>
  );
}

export default PaymentVerification;
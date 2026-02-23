import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCar, FaArrowLeft, FaDownload, FaCheckCircle, FaClock, FaTimesCircle, FaCreditCard } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import { bluebookDetailLabels } from "../labels/bluebookDetailLabels";

function BluebookDetail() {
  // Main component for displaying bluebook details page

  const { id } = useParams();
  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [bluebook, setBluebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBluebookDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Fetches bluebook details from the API using the provided ID.
   * Handles authentication, error, and loading state.
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
   * Formats a date string into a readable format (e.g., January 1, 2024).
   * Returns 'N/A' if the date is not provided.
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
   * Returns a status badge JSX element based on the bluebook status.
   * @param {string} status
   * @returns {JSX.Element}
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-2" />
          {getLabel(bluebookDetailLabels.verified)}
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <FaClock className="mr-2" />
          {getLabel(bluebookDetailLabels.pendingVerification)}
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <FaTimesCircle className="mr-2" />
          {getLabel(bluebookDetailLabels.rejected)}
        </span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {getLabel(bluebookDetailLabels.unknown)}
        </span>;
    }
  };

  /**
 * Checks if the provided expiry date is in the past.
 * @param {string} expireDate
 * @returns {boolean}
 */
const isExpired = (expireDate) => {
  if (!expireDate) return false;
  return new Date(expireDate) < new Date();
};

/**
 * Checks if the tax is expiring within 15 days or is already expired.
 * @param {string} expireDate
 * @returns {boolean}
 */
const shouldShowPayTax = (expireDate) => {
  if (!expireDate) return false;
  const today = new Date();
  const expiry = new Date(expireDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 15; // Show pay tax button 15 days before expiry or after expiry
};

  /**
   * Calculates the number of days until expiry.
   * @param {string} expireDate
   * @returns {number}
   */
  const getDaysUntilExpiry = (expireDate) => {
    if (!expireDate) return 0;
    const today = new Date();
    const expiry = new Date(expireDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Handles downloading the bluebook PDF.
   * @param {string} id
   */
  const handleDownload = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bluebook/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bluebook-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download bluebook');
      }
    } catch (error) {
      console.error('Error downloading bluebook:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nepal-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{getLabel(bluebookDetailLabels.error)}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nepal-blue hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            {getLabel(bluebookDetailLabels.backToDashboard)}
          </button>
        </div>
      </div>
    );
  }

  if (!bluebook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">{getLabel(bluebookDetailLabels.notFound)}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nepal-blue hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            {getLabel(bluebookDetailLabels.backToDashboard)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-full bg-white shadow hover:bg-nepal-blue/10 transition-all duration-200"
              >
                <FaArrowLeft className="h-5 w-5 text-nepal-blue" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-nepal-blue">
                  {getLabel(bluebookDetailLabels.bluebookDetails)}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {getLabel(bluebookDetailLabels.vehicleRegistrationInfo)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {getStatusBadge(bluebook.status)}
              {bluebook.status === 'verified' && (
                <button
                  onClick={() => handleDownload(bluebook._id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nepal-blue hover:bg-blue-700"
                >
                  <FaDownload className="mr-2" />
                  {getLabel(bluebookDetailLabels.download)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Vehicle Information */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <FaCar className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">{getLabel(bluebookDetailLabels.vehicleInformation)}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.vehicleRegistrationNumber)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.vehicleRegNo}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.vehicleType)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.vehicleType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.vehicleOwnerName)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.vehicleOwnerName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.vehicleNumber)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.vehicleNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.vehicleModel)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.vehicleModel || bluebook.VehicleModel || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.manufactureYear)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.manufactureYear}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.chassisNumber)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.chasisNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.vehicleColor)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.vehicleColor}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.engineCC)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{bluebook.vehicleEngineCC} cc</p>
              </div>
            </div>
          </div>

          {/* Registration and Tax Information */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{getLabel(bluebookDetailLabels.registrationAndTaxInformation)}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.vehicleRegistrationDate)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(bluebook.VehicleRegistrationDate)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.taxPayDate)}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(bluebook.taxPayDate)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.taxExpireDate)}</label>
                <div className="flex items-center gap-2">
                  <p className={`mt-1 text-lg font-semibold ${isExpired(bluebook.taxExpireDate) ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(bluebook.taxExpireDate)}
                  </p>
                  {isExpired(bluebook.taxExpireDate) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {getLabel(bluebookDetailLabels.expired)}
                    </span>
                  )}
                </div>
              </div>
              
              {!isExpired(bluebook.taxExpireDate) && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">{getLabel(bluebookDetailLabels.daysUntilExpiry)}</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{getDaysUntilExpiry(bluebook.taxExpireDate)} {getLabel(bluebookDetailLabels.days)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status and Actions */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{getLabel(bluebookDetailLabels.statusInformation)}</h3>
                <p className="text-sm text-gray-600">
                  {getLabel(bluebookDetailLabels.createdOn)} {formatDate(bluebook.createdAt)}
                  {bluebook.updatedAt && bluebook.updatedAt !== bluebook.createdAt && (
                    <span> • {getLabel(bluebookDetailLabels.lastUpdatedOn)} {formatDate(bluebook.updatedAt)}</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {bluebook.status === 'verified' && shouldShowPayTax(bluebook.taxExpireDate) && (
                  <button
                    onClick={() => navigate(`/payment/${bluebook._id}`)}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      isExpired(bluebook.taxExpireDate) 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    <FaCreditCard className="mr-2" />
                    {isExpired(bluebook.taxExpireDate) ? getLabel(bluebookDetailLabels.payTaxExpired) : getLabel(bluebookDetailLabels.payTaxDueSoon)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BluebookDetail;
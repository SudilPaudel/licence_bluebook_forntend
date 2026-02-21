import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCar, FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaPlus, FaSearch, FaDownload, FaEdit, FaTrash, FaMotorcycle, FaUserCircle, FaBatteryFull } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import { dashboardLabels } from "../labels/dashboardLabels";
import MyElectricBluebooks from "../components/MyElectricBluebooks";
import Pagination from "../components/Pagination";

function Dashboard() {
  // Main dashboard component for displaying user bluebooks and stats
  const { getLabel } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [bluebooks, setBluebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    expired: 0,
    electric: 0,
    dueSoon: 0
  });

  useEffect(() => {
    checkAuth();
    
    // Handle payment verification redirect
    const paymentVerification = searchParams.get('payment_verification');
    const electricPaymentVerification = searchParams.get('electric_payment_verification');
    const id = searchParams.get('id');
    const pidx = searchParams.get('pidx');
    
    if (paymentVerification === 'true' && id) {
      // Redirect to payment verification page
      const redirectUrl = pidx 
        ? `/payment-verification/${id}?pidx=${pidx}`
        : `/payment-verification/${id}`;
      navigate(redirectUrl);
    }
    
    if (electricPaymentVerification === 'true' && id) {
      // Redirect to electric payment verification page
      const redirectUrl = pidx 
        ? `/electric-payment-verification/${id}?pidx=${pidx}`
        : `/electric-payment-verification/${id}`;
      navigate(redirectUrl);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUserBluebooks(currentPage);
  }, [currentPage]);

  /**
   * Checks if the user is authenticated by verifying localStorage.
   * Redirects to login if not authenticated.
   */
  const checkAuth = () => {
    const userDetail = localStorage.getItem('userDetail');
    const token = localStorage.getItem('accessToken');

    if (!userDetail || !token) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(userDetail));
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  };

  /**
   * Fetches the user's bluebooks from the API and updates state and stats.
   */
  const fetchUserBluebooks = async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const limit = 5;
      // Fetch both bluebook types in parallel
      const [response, electricResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/bluebook/my-bluebooks?page=${page}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/electric-bluebook/my-bluebooks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      let fuelBluebooks = [];
      let electricBluebooks = [];
      let meta = {};

      if (response.ok) {
        const data = await response.json();
        fuelBluebooks = data.result || [];
        meta = data.meta;
        setTotalPages(meta.totalPages || 1);
      }
      if (electricResponse.ok) {
        const electricData = await electricResponse.json();
        electricBluebooks = electricData.result || [];
      }

      // Combine both bluebook types
      const allBluebooks = [...fuelBluebooks, ...electricBluebooks.map(bb => ({ ...bb, isElectric: true }))];
      console.log('All bluebooks data:', allBluebooks);
      setBluebooks(fuelBluebooks);

      // Calculate stats from combined data
      const total = allBluebooks.length;
      const pending = allBluebooks.filter(bb => bb.status === 'pending').length;
      const verified = allBluebooks.filter(bb => bb.status === 'verified').length;
      const expired = allBluebooks.filter(bb => {
        if (bb.taxExpireDate) {
          return new Date(bb.taxExpireDate) < new Date();
        }
        return false;
      }).length;
      const electric = electricBluebooks.length;
      const dueSoon = allBluebooks.filter(bb => {
        if (bb.taxExpireDate) {
          const today = new Date();
          const expiry = new Date(bb.taxExpireDate);
          const diffTime = expiry - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 15 && diffDays > 0; // Due soon but not expired yet
        }
        return false;
      }).length;

      setStats({ total, pending, verified, expired, electric, dueSoon });
    }
  catch (error) {
    console.error('Error fetching bluebooks:', error);
  } finally {
    setLoading(false);
  }
};

const handlePageChange = (page) => {
    setCurrentPage(page);
};


/**
 * Handles downloading a bluebook PDF by ID.
 * Prompts login if not authenticated.
 * @param {string} id
 */
const handleDownload = async (id, isElectric = false) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const endpoint = isElectric ? `/electric-bluebook/${id}/download` : `/bluebook/${id}/download`;
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${isElectric ? 'electric_' : ''}bluebook_${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } else {
      console.error('Failed to download bluebook');
    }
  } catch (error) {
    console.error('Error downloading bluebook:', error);
  }
};

/**
 * Formats a date string into a readable format (e.g., Jan 1, 2024).
 * Returns 'N/A' if the date is not provided.
 * @param {string} dateString
 * @returns {string}
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
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
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheckCircle className="mr-1" />
        {getLabel(dashboardLabels.verified)}
      </span>;
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FaClock className="mr-1" />
        {getLabel(dashboardLabels.pending)}
      </span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {getLabel(dashboardLabels.unknown)}
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

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nepal-blue"></div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
    {/* Header */}
    <div className="bg-white/80 backdrop-blur shadow-md border-b sticky top-0 z-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-8 animate-fade-in-down">
          <div>
            <h1 className="text-4xl font-extrabold text-nepal-blue tracking-tight drop-shadow-sm">{getLabel(dashboardLabels.dashboard)}</h1>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {getLabel(dashboardLabels.welcomeBack)}, <span className="text-nepal-blue font-semibold">{user?.name || 'User'}</span>
            </p>

          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/bluebook/new')}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-nepal-blue to-blue-500 hover:scale-105 hover:from-blue-700 hover:to-nepal-blue transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
            >
              <FaPlus className="mr-2 animate-bounce" />
              {getLabel(dashboardLabels.newBluebook)}
            </button>
            <button
              onClick={() => navigate('/electric-bluebook/new')}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-nepal-blue to-blue-500 hover:scale-105 hover:from-blue-700 hover:to-nepal-blue transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
            >
              <FaPlus className="mr-2 animate-bounce" />
              {getLabel(dashboardLabels.newElectricBluebook)}
            </button>
            {
              user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-nepal-blue to-blue-500 hover:scale-105 hover:from-blue-700 hover:to-nepal-blue transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
                >
                  <FaUserCircle className="mr-2 animate-bounce" />
                  {getLabel(dashboardLabels.adminDashboard)}
                </button>
              )
            }
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex items-center space-x-4 hover:scale-105 transition-transform duration-200 animate-fade-in-up">
            <div className="flex-shrink-0 bg-nepal-blue/10 rounded-full p-3">
          <FaCar className="h-7 w-7 text-nepal-blue" />
            </div>
            <div>
          <div className="text-sm font-semibold text-gray-500">{getLabel(dashboardLabels.totalBluebooks)}</div>
          <div className="text-2xl font-bold text-nepal-blue">{stats.total}</div>
            </div>
          </div>
          <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex items-center space-x-4 hover:scale-105 transition-transform duration-200 animate-fade-in-up delay-75">
            <div className="flex-shrink-0 bg-yellow-400/10 rounded-full p-3">
          <FaClock className="h-7 w-7 text-yellow-400" />
            </div>
            <div>
          <div className="text-sm font-semibold text-gray-500">{getLabel(dashboardLabels.pending)}</div>
          <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            </div>
          </div>
          <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex items-center space-x-4 hover:scale-105 transition-transform duration-200 animate-fade-in-up delay-150">
            <div className="flex-shrink-0 bg-green-400/10 rounded-full p-3">
          <FaCheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <div>
          <div className="text-sm font-semibold text-gray-500">{getLabel(dashboardLabels.verified)}</div>
          <div className="text-2xl font-bold text-green-500">{stats.verified}</div>
            </div>
          </div>
          <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex items-center space-x-4 hover:scale-105 transition-transform duration-200 animate-fade-in-up delay-200">
            <div className="flex-shrink-0 bg-red-400/10 rounded-full p-3">
          <FaTimesCircle className="h-7 w-7 text-red-500" />
            </div>
            <div>
          <div className="text-sm font-semibold text-gray-500">{getLabel(dashboardLabels.expired)}</div>
          <div className="text-2xl font-bold text-red-500">{stats.expired}</div>
            </div>
          </div>
          <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex items-center space-x-4 hover:scale-105 transition-transform duration-200 animate-fade-in-up delay-250">
            <div className="flex-shrink-0 bg-green-400/10 rounded-full p-3">
          <FaBatteryFull className="h-7 w-7 text-green-500" />
            </div>
            <div>
          <div className="text-sm font-semibold text-gray-500">{getLabel(dashboardLabels.electric)}</div>
          <div className="text-2xl font-bold text-green-500">{stats.electric}</div>
            </div>
          </div>
          <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex items-center space-x-4 hover:scale-105 transition-transform duration-200 animate-fade-in-up delay-300">
            <div className="flex-shrink-0 bg-orange-400/10 rounded-full p-3">
          <FaClock className="h-7 w-7 text-orange-500" />
            </div>
            <div>
          <div className="text-sm font-semibold text-gray-500">{getLabel(dashboardLabels.dueSoon)}</div>
          <div className="text-2xl font-bold text-orange-500">{stats.dueSoon}</div>
            </div>
          </div>
        </div>
          <div className="bg-white/90 shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex justify-between items-center">
            <div>
          <h3 className="text-xl font-bold text-nepal-blue">{getLabel(dashboardLabels.myBluebooks)}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {getLabel(dashboardLabels.manageBluebooks)}
          </p>
            </div>
            <div className="flex space-x-2"></div>
          </div>
            </div>

            {bluebooks.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <FaFileAlt className="mx-auto h-14 w-14 text-gray-300 animate-pulse" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{getLabel(dashboardLabels.noBluebooks)}</h3>
            <p className="mt-2 text-base text-gray-500">
          {getLabel(dashboardLabels.getStartedBluebook)}
            </p>
            <div className="mt-8">
          <button
            onClick={() => navigate('/bluebook/new')}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-lg text-base font-semibold rounded-lg text-white bg-gradient-to-r from-nepal-blue to-blue-500 hover:scale-105 hover:from-blue-700 hover:to-nepal-blue transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
          >
            <FaPlus className="mr-2 animate-bounce" />
            {getLabel(dashboardLabels.newBluebook)}
          </button>
            </div>
          </div>
            ) : (
          <ul className="divide-y divide-gray-100">
            {bluebooks.map((bluebook, idx) => (
          <li
            key={bluebook._id}
            className="px-6 py-6 hover:bg-blue-50/60 transition-colors duration-200 group animate-fade-in-up"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {bluebook.isElectric ? (
                <FaBatteryFull className="h-10 w-10 text-green-500 drop-shadow group-hover:scale-110 transition-transform duration-200" />
              ) : bluebook.vehicleType === "Car" ? (
                <FaCar className="h-10 w-10 text-nepal-blue drop-shadow group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <FaMotorcycle className="h-10 w-10 text-nepal-blue drop-shadow group-hover:scale-110 transition-transform duration-200" />
              )}
            </div>
            <div className="ml-6">
              <div className="flex items-center space-x-3">
            <h4 className="text-lg font-bold text-gray-900 group-hover:text-nepal-blue transition-colors duration-200">
              {bluebook.vehicleOwnerName}
            </h4>
            {getStatusBadge(bluebook.status)}
            {isExpired(bluebook.taxExpireDate) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse">
            {getLabel(dashboardLabels.expired)}
              </span>
            )}
            {!isExpired(bluebook.taxExpireDate) && shouldShowPayTax(bluebook.taxExpireDate) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 animate-pulse">
            {getLabel(dashboardLabels.dueSoon)}
              </span>
            )}
              </div>
              <div className="mt-2 text-sm text-gray-500 space-x-2">
            <span className="font-medium">{getLabel(dashboardLabels.regNo)}:</span> {bluebook.vehicleRegNo}
            <span className="font-medium">| {getLabel(dashboardLabels.model)}:</span> {bluebook.vehicleModel || bluebook.VehicleModel || 'N/A'}
            <span className="font-medium">| {getLabel(dashboardLabels.vehicleNumber)}:</span> {bluebook.vehicleNumber}
            {bluebook.isElectric && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FaBatteryFull className="mr-1" />
                {getLabel(dashboardLabels.electric)}
              </span>
            )}
              </div>
              <div className="mt-1 text-sm text-gray-400">
            <span className="font-medium">{getLabel(dashboardLabels.taxExpires)}:</span> {formatDate(bluebook.taxExpireDate)}
            <span className="font-medium ml-2">| {getLabel(dashboardLabels.created)}:</span> {formatDate(bluebook.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
            bluebook.isElectric
              ? navigate(`/electric-bluebook/${bluebook._id}`)
              : navigate(`/bluebook/${bluebook._id}`)
              }
              className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-semibold rounded-lg text-nepal-blue bg-white hover:bg-nepal-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
            >
              <FaEdit className="mr-1" />
              {getLabel(dashboardLabels.view)}
            </button>
            <button
              onClick={() => handleDownload(bluebook._id, bluebook.isElectric)}
              className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-semibold rounded-lg text-nepal-blue bg-white hover:bg-nepal-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
            >
              <FaDownload className="mr-1" />
              {getLabel(dashboardLabels.download)}
            </button>
            {shouldShowPayTax(bluebook.taxExpireDate) && (
              <button
            onClick={() => {
              console.log('Pay Tax clicked for bluebook:', bluebook);
              console.log('Is Electric:', bluebook.isElectric);
              console.log('Bluebook ID:', bluebook._id);
              console.log('Vehicle Type:', bluebook.vehicleType);
              console.log('Battery Capacity:', bluebook.vehicleBatteryCapacity);
              
              bluebook.isElectric
                ? navigate(`/electric-payment/${bluebook._id}`)
                : navigate(`/payment/${bluebook._id}`)
            }}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isExpired(bluebook.taxExpireDate) 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 focus:ring-red-500' 
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-105 focus:ring-yellow-500'
            }`}
              >
            <FaFileAlt className="mr-1" />
            {isExpired(bluebook.taxExpireDate) ? getLabel(dashboardLabels.payTaxExpired) : getLabel(dashboardLabels.payTaxDueSoon)}
              </button>
            )}
          </div>
            </div>
          </li>
            ))}
          </ul>
            )}
             <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
          </div>

          

      <MyElectricBluebooks />

      <div className="mt-12 bg-white/90 shadow-xl rounded-2xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
          <h3 className="text-xl font-bold text-nepal-blue">{getLabel(dashboardLabels.quickActions)}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {getLabel(dashboardLabels.commonTasks)}
          </p>
        </div>
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/bluebook/new')}
              className="flex items-center justify-center px-6 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-nepal-blue to-blue-500 shadow-lg hover:scale-105 hover:from-blue-700 hover:to-nepal-blue transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
            >
              <FaPlus className="mr-2 animate-bounce" />
              {getLabel(dashboardLabels.registerNewBluebook)}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center px-6 py-4 border border-gray-200 text-base font-semibold rounded-xl text-nepal-blue bg-white shadow-lg hover:bg-nepal-blue hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nepal-blue"
            >
              <FaFileAlt className="mr-2" />
              {getLabel(dashboardLabels.viewProfile)}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Animations */}
    <style>
      {`
          .animate-fade-in-up {
            animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
          }
          .animate-fade-in-down {
            animation: fadeInDown 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          @keyframes fadeInDown {
            0% { opacity: 0; transform: translateY(-40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
        `}
    </style>
  </div>
);
}

export default Dashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { adminDashboardLabels } from "../labels/adminDashboardLabels";
import {
  FaUsers,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaShieldAlt,
  FaChartBar,
  FaEye,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaDownload,
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaFileAlt,
  FaCog,
  FaTrash,
  FaBan,
  FaUserPlus,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaNewspaper,
  FaMotorcycle,
  FaPlus,
  FaImage,
  FaBatteryFull
} from "react-icons/fa";
import fallbackNews from "../assets/news1.jpeg";
import { toast } from "react-toastify";

// Helper function to get API URL
const getApiUrl = (endpoint) => {
  // Use relative URL for proxy, fallback to full URL if needed
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [bluebooks, setBluebooks] = useState([]);
  const [pendingBluebooks, setPendingBluebooks] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBluebooks: 0,
    pendingBluebooks: 0,
    verifiedBluebooks: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    citizenshipNo: '',
    role: 'user',
    status: 'active'
  });
  const [showEditBluebookModal, setShowEditBluebookModal] = useState(false);
  const [editingBluebook, setEditingBluebook] = useState(null);
  const [editBluebookFormData, setEditBluebookFormData] = useState({
    vehicleRegNo: '',
    vehicleOwnerName: '',
    vehicleType: '',
    vehicleModel: '',
    manufactureYear: '',
    chasisNumber: '',
    vehicleColor: '',
    vehicleEngineCC: '',
    vehicleNumber: '',
    status: 'pending',
    VehicleRegistrationDate: '',
    taxPayDate: '',
    taxExpireDate: ''
  });
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({ name: '', email: '', citizenshipNo: '', password: '' });
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState('');
  const [createAdminSuccess, setCreateAdminSuccess] = useState('');
  
  // Payment details modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [bluebookSearchTerm, setBluebookSearchTerm] = useState('');
  const [filteredBluebooks, setFilteredBluebooks] = useState([]);

  // News management state
  const [news, setNews] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    status: 'draft',
    priority: 1,
    tags: []
  });
  const [newsImage, setNewsImage] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');
  const [editingNews, setEditingNews] = useState(null);
  const [showDeleteNewsModal, setShowDeleteNewsModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [pendingAdminUserId, setPendingAdminUserId] = useState(null);

  // Marquee management state
  const [marqueeText, setMarqueeText] = useState('');
  const [marqueeLoading, setMarqueeLoading] = useState(false);
  const [marqueeError, setMarqueeError] = useState('');
  const [marqueeSuccess, setMarqueeSuccess] = useState('');

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
    fetchMarqueeText();
  }, []);

  // Filter payments based on selected filter
  useEffect(() => {
    if (payments.length > 0) {
      let filtered = [];
      
      switch (paymentFilter) {
        case 'successful':
          filtered = payments.filter(payment => payment.status === 'successful');
          break;
        case 'pending':
          filtered = payments.filter(payment => payment.status === 'pending');
          break;
        case 'failed':
          filtered = payments.filter(payment => payment.status === 'failed');
          break;
        case 'electric':
          filtered = payments.filter(payment => payment.isElectric === true);
          break;
        case 'fuel':
          filtered = payments.filter(payment => payment.isElectric === false);
          break;
        default:
          filtered = payments;
      }
      
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments([]);
    }
  }, [payments, paymentFilter]);

  // Filter bluebooks based on search term
  useEffect(() => {
    if (bluebooks.length > 0) {
      if (bluebookSearchTerm.trim() === '') {
        setFilteredBluebooks(bluebooks);
      } else {
        const searchTerm = bluebookSearchTerm.toLowerCase().trim();
        const filtered = bluebooks.filter(bluebook => {
          const ownerName = (bluebook.vehicleOwnerName || '').toLowerCase();
          const regNo = (bluebook.vehicleRegNo || '').toLowerCase();
          const model = (bluebook.vehicleModel || bluebook.VehicleModel || '').toLowerCase();
          
          return ownerName.includes(searchTerm) || 
                 regNo.includes(searchTerm) || 
                 model.includes(searchTerm);
        });
        setFilteredBluebooks(filtered);
      }
    } else {
      setFilteredBluebooks([]);
    }
  }, [bluebooks, bluebookSearchTerm]);

  // Checks authentication and redirects user if not admin or not logged in.
  const checkAuth = () => {
    // Checks localStorage for user details and token, parses user, and redirects if not admin.
    const userDetail = localStorage.getItem('userDetail');
    const token = localStorage.getItem('accessToken');

    if (!userDetail || !token) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userDetail);
      if (userData.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  };

  // Fetches all dashboard data: users, bluebooks, pending bluebooks, payments, and news.
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Fetch users
      const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.result || []);
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.meta?.total || 0,
          activeUsers: usersData.meta?.active || 0
        }));
      }

      // Fetch all bluebooks (both regular and electric)
      const [bluebooksResponse, electricBluebooksResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/bluebook/admin/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/electric-bluebook/admin/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      let allBluebooks = [];
      let totalBluebooks = 0;
      let pendingBluebooks = 0;
      let verifiedBluebooks = 0;

      if (bluebooksResponse.ok) {
        const bluebooksData = await bluebooksResponse.json();
        const regularBluebooks = bluebooksData.result || [];
        allBluebooks = [...allBluebooks, ...regularBluebooks];
        totalBluebooks += bluebooksData.meta?.total || 0;
        pendingBluebooks += bluebooksData.meta?.pending || 0;
        verifiedBluebooks += bluebooksData.meta?.verified || 0;
      }

      if (electricBluebooksResponse.ok) {
        const electricBluebooksData = await electricBluebooksResponse.json();
        const electricBluebooks = electricBluebooksData.result || [];
        allBluebooks = [...allBluebooks, ...electricBluebooks];
        totalBluebooks += electricBluebooksData.meta?.total || 0;
        pendingBluebooks += electricBluebooksData.meta?.pending || 0;
        verifiedBluebooks += electricBluebooksData.meta?.verified || 0;
      }

      setBluebooks(allBluebooks);
      setStats(prev => ({
        ...prev,
        totalBluebooks,
        pendingBluebooks,
        verifiedBluebooks
      }));

      // Fetch pending bluebooks (both regular and electric)
      const [pendingResponse, electricPendingResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/bluebook/admin/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/electric-bluebook/admin/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      let allPendingBluebooks = [];

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        allPendingBluebooks = [...allPendingBluebooks, ...(pendingData.result || [])];
      }

      if (electricPendingResponse.ok) {
        const electricPendingData = await electricPendingResponse.json();
        allPendingBluebooks = [...allPendingBluebooks, ...(electricPendingData.result || [])];
      }

      setPendingBluebooks(allPendingBluebooks);

      // Fetch payments
      const paymentsResponse = await fetch(`${import.meta.env.VITE_API_URL}/admin/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.result || []);
      }

      // Fetch news
      const newsResponse = await fetch(`/news`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        setNews(newsData.result || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handles bluebook verification by sending a request to the backend and refreshing data.
  const handleVerifyBluebook = async (bluebookId, isElectric = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = isElectric ? `/electric-bluebook/${bluebookId}/verify` : `/bluebook/${bluebookId}/verify`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(getLabel(adminDashboardLabels.bluebookVerifiedSuccess));
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.message || getLabel(adminDashboardLabels.failedToVerifyBluebook));
      }
    } catch (error) {
      console.error('Error verifying bluebook:', error);
      toast.error(getLabel(adminDashboardLabels.errorVerifyingBluebook));
    }
  };

  // Updates a user's status (active/inactive) and refreshes dashboard data.
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`${getLabel(adminDashboardLabels.userStatusUpdatedTo)} ${newStatus} ${getLabel(adminDashboardLabels.successfully)}`);
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.message || getLabel(adminDashboardLabels.failedToUpdateUserStatus));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(getLabel(adminDashboardLabels.errorUpdatingUserStatus));
    }
  };

  // Formats a date string into a readable format.
  const formatDate = (dateString) => {
    // Converts a date string to a human-readable format or returns 'N/A' if not present.
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Returns a badge component for bluebook status.
  const getStatusBadge = (status) => {
    // Returns a styled badge based on bluebook status (verified, pending, rejected, unknown).
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1" />
          Verified
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaClock className="mr-1" />
          Pending
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimesCircle className="mr-1" />
          Rejected
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>;
    }
  };

  // Returns a badge component for user status.
  const getUserStatusBadge = (status) => {
    // Returns a styled badge for user status (active/inactive).
    return status === 'active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheckCircle className="mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimesCircle className="mr-1" />
        Inactive
      </span>
    );
  };

  // Returns a badge component for user role.
  const getUserRoleBadge = (role) => {
    // Returns a styled badge for user role (admin/user).
    return role === 'admin' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <FaShieldAlt className="mr-1" />
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <FaUsers className="mr-1" />
        User
      </span>
    );
  };

  // Opens the user details modal for the selected user.
  const handleViewUserDetails = (user) => {
    // Sets selected user and shows the user modal.
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Opens the delete confirmation modal for the selected user.
  const handleDeleteUser = (user) => {
    // Sets user to delete and shows the delete modal.
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Opens the edit modal and sets the selected user's data for editing.
  const handleEditUser = (user) => {
    // Sets editing user and populates edit form data, then shows edit modal.
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      citizenshipNo: user.citizenshipNo,
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  // Handles changes in the edit user form fields.
  const handleEditFormChange = (e) => {
    // Updates edit form data state as user types in the edit modal.
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sends updated user data to the backend and refreshes dashboard data.
  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        toast.success(getLabel(adminDashboardLabels.userUpdatedSuccess));
        fetchDashboardData(); // Refresh data
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        toast.error(error.message || getLabel(adminDashboardLabels.failedToUpdateUser));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(getLabel(adminDashboardLabels.errorUpdatingUser));
    }
  };

  // Opens the edit bluebook modal and sets the selected bluebook's data.
  const handleEditBluebook = (bluebook) => {
    // Sets editing bluebook and populates edit bluebook form data, then shows modal.
    setEditingBluebook(bluebook);
    setEditBluebookFormData({
      vehicleRegNo: bluebook.vehicleRegNo || '',
      vehicleOwnerName: bluebook.vehicleOwnerName || '',
      vehicleType: bluebook.vehicleType || '',
      vehicleModel: bluebook.vehicleModel || '',
      manufactureYear: bluebook.manufactureYear || '',
      chasisNumber: bluebook.chasisNumber || '',
      vehicleColor: bluebook.vehicleColor || '',
      vehicleEngineCC: bluebook.vehicleEngineCC || '',
      vehicleNumber: bluebook.vehicleNumber || '',
      status: bluebook.status || 'pending',
      VehicleRegistrationDate: bluebook.VehicleRegistrationDate ? bluebook.VehicleRegistrationDate.slice(0, 10) : '',
      taxPayDate: bluebook.taxPayDate ? bluebook.taxPayDate.slice(0, 10) : '',
      taxExpireDate: bluebook.taxExpireDate ? bluebook.taxExpireDate.slice(0, 10) : ''
    });
    setShowEditBluebookModal(true);
  };

  // Handles changes in the edit bluebook form fields.
  const handleEditBluebookFormChange = (e) => {
    // Updates edit bluebook form data state as user types in the modal.
    const { name, value } = e.target;
    setEditBluebookFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sends updated bluebook data to the backend and refreshes dashboard data.
  const handleUpdateBluebook = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bluebook/admin/${editingBluebook._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editBluebookFormData)
      });

      if (response.ok) {
        toast.success(getLabel(adminDashboardLabels.bluebookUpdatedSuccess));
        fetchDashboardData(); // Refresh data
        setShowEditBluebookModal(false);
        setEditingBluebook(null);
      } else {
        const error = await response.json();
        toast.error(error.message || getLabel(adminDashboardLabels.failedToUpdateBluebook));
      }
    } catch (error) {
      console.error('Error updating bluebook:', error);
      toast.error(getLabel(adminDashboardLabels.errorUpdatingBluebook));
    }
  };

  // Confirms and deletes a user, then refreshes dashboard data.
  const confirmDeleteUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(getLabel(adminDashboardLabels.userDeletedSuccess));
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.message || getLabel(adminDashboardLabels.failedToDeleteUser));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(getLabel(adminDashboardLabels.errorDeletingUser));
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Rejects a bluebook by sending a request to the backend and refreshes data.
  const handleRejectBluebook = async (bluebookId, isElectric = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = isElectric ? `/electric-bluebook/${bluebookId}/reject` : `/bluebook/${bluebookId}/reject`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(isElectric ? getLabel(adminDashboardLabels.electricBluebookRejectedSuccess) : getLabel(adminDashboardLabels.bluebookRejectedSuccess));
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.message || getLabel(adminDashboardLabels.failedToRejectBluebook));
      }
    } catch (error) {
      console.error('Error rejecting bluebook:', error);
      toast.error(getLabel(adminDashboardLabels.errorRejectingBluebook));
    }
  };

  // Generates a report PDF for users, bluebooks, or payments.
  const generateReport = async (reportType) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error(getLabel(adminDashboardLabels.noAuthToken));
        return;
      }

      console.log('Making request to:', `${import.meta.env.VITE_API_URL}/admin/reports/${reportType}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/reports/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        let blob;
        try {
          const arrayBuffer = await response.arrayBuffer();
          blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        } catch (blobError) {
          toast.error(getLabel(adminDashboardLabels.errorProcessingPdf));
          return;
        }
        
        if (blob.size === 0) {
          toast.error(getLabel(adminDashboardLabels.emptyPdf));
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up immediately after download
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        
        toast.success(`${reportType} ${getLabel(adminDashboardLabels.reportGeneratedSuccess)}`);
              } else {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            toast.error(errorData.message || getLabel(adminDashboardLabels.failedToGenerateReport));
          } else {
            toast.error(`${getLabel(adminDashboardLabels.serverError)}: ${response.status} ${response.statusText}`);
          }
        }
      } catch (error) {
        toast.error(getLabel(adminDashboardLabels.networkErrorReport));
      }
  };

  // Handles changes in the create admin form fields.
  const handleCreateAdminFormChange = (e) => {
    // Updates create admin form state as user types.
    const { name, value } = e.target;
    setCreateAdminForm(prev => ({ ...prev, [name]: value }));
  };

  // Sends a request to create a new admin and refreshes dashboard data.
  const handleCreateAdmin = async () => {
    setCreateAdminLoading(true);
    setCreateAdminError('');
    setCreateAdminSuccess('');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createAdminForm)
      });
      const data = await response.json();
      if (response.ok) {
        setCreateAdminSuccess('Admin registration successful! Please check email for OTP.');
        setPendingAdminUserId(data.result.userId);
        setShowCreateAdminModal(false);
        setShowOtpModal(true);
        setCreateAdminForm({ name: '', email: '', citizenshipNo: '', password: '' });
      } else {
        setCreateAdminError(data.message || 'Failed to create admin');
      }
    } catch (error) {
      setCreateAdminError('An error occurred while creating admin');
    } finally {
      setCreateAdminLoading(false);
    }
  };

  // Handle view payment details
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  // Handle download payment receipt
  const handleDownloadPayment = async (payment) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/payment-receipt/${payment._id}`, {
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
        a.download = `payment-receipt-${payment.transactionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(getLabel(adminDashboardLabels.paymentReceiptDownloadSuccess));
      } else {
        toast.error(getLabel(adminDashboardLabels.failedToDownloadPaymentReceipt));
      }
    } catch (error) {
      console.error('Error downloading payment receipt:', error);
      toast.error(getLabel(adminDashboardLabels.networkError));
    }
  };

  // Handles changes in the news form fields.
  const handleNewsFormChange = (e) => {
    // Updates news form state as user types.
    const { name, value } = e.target;
    setNewsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handles image file selection for news.
  const handleNewsImageChange = (e) => {
    // Sets selected image file for news article.
    const file = e.target.files[0];
    if (file) {
      setNewsImage(file);
    }
  };

  // Sends a request to create a news article and refreshes dashboard data.
  const handleCreateNews = async () => {
    setNewsLoading(true);
    setNewsError('');
    setNewsSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // Append form data
      Object.keys(newsForm).forEach(key => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(newsForm[key]));
        } else {
          formData.append(key, newsForm[key]);
        }
      });

      // Append image if selected
      if (newsImage) {
        formData.append('image', newsImage);
      }

      const response = await fetch(`/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setNewsSuccess('News article created successfully!');
        setNewsForm({
          title: '',
          content: '',
          status: 'draft',
          priority: 1,
          tags: []
        });
        setNewsImage(null);
        fetchDashboardData();
        setTimeout(() => {
          setShowNewsModal(false);
          setNewsSuccess('');
        }, 1200);
      } else {
        setNewsError(data.message || 'Failed to create news article');
      }
    } catch (error) {
      setNewsError('An error occurred while creating news article');
    } finally {
      setNewsLoading(false);
    }
  };

  // Opens the news modal for editing and sets the selected news data.
  const handleEditNews = (newsItem) => {
    // Sets editing news and populates news form, then shows modal.
    setEditingNews(newsItem);
    setNewsForm({
      title: newsItem.title,
      content: newsItem.content,
      status: newsItem.status,
      priority: newsItem.priority,
      tags: newsItem.tags || []
    });
    setShowNewsModal(true);
  };

  // Sends updated news data to the backend and refreshes dashboard data.
  const handleUpdateNews = async () => {
    setNewsLoading(true);
    setNewsError('');
    setNewsSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // Append form data
      Object.keys(newsForm).forEach(key => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(newsForm[key]));
        } else {
          formData.append(key, newsForm[key]);
        }
      });

      // Append image if selected
      if (newsImage) {
        formData.append('image', newsImage);
      }

      const response = await fetch(`/news/${editingNews._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setNewsSuccess('News article updated successfully!');
        setNewsForm({
          title: '',
          content: '',
          status: 'draft',
          priority: 1,
          tags: []
        });
        setNewsImage(null);
        setEditingNews(null);
        fetchDashboardData();
        setTimeout(() => {
          setShowNewsModal(false);
          setNewsSuccess('');
        }, 1200);
      } else {
        setNewsError(data.message || 'Failed to update news article');
      }
    } catch (error) {
      setNewsError('An error occurred while updating news article');
    } finally {
      setNewsLoading(false);
    }
  };

  // Opens the delete confirmation modal for the selected news article.
  const handleDeleteNews = (newsItem) => {
    // Sets news to delete and shows delete modal.
    setNewsToDelete(newsItem);
    setShowDeleteNewsModal(true);
  };

  // Confirms and deletes a news article, then refreshes dashboard data.
  const confirmDeleteNews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Try relative URL first (for proxy)
      let response = await fetch(`/news/${newsToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If relative URL fails, try full URL
      if (!response.ok && response.status !== 404) {
        console.log('Relative URL failed, trying full URL...');
        response = await fetch(`${import.meta.env.VITE_API_URL}/news/${newsToDelete._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        toast.success(getLabel(adminDashboardLabels.newsDeletedSuccess));
        fetchDashboardData();
        setShowDeleteNewsModal(false);
        setNewsToDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.message || getLabel(adminDashboardLabels.failedToDeleteNews));
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error(getLabel(adminDashboardLabels.errorDeletingNews));
    }
  };

  // Updates the status of a news article (active/inactive/draft).
  const handleUpdateNewsStatus = async (newsId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Try relative URL first (for proxy)
      let apiUrl = getApiUrl(`/news/${newsId}/status`);
      let response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      // If relative URL fails, try full URL
      if (!response.ok && response.status !== 404) {
        console.log('Relative URL failed, trying full URL...');
        apiUrl = `${import.meta.env.VITE_API_URL}/news/${newsId}/status`;
        response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
      }
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        toast.success(`${getLabel(adminDashboardLabels.newsStatusUpdatedTo)} ${newStatus} ${getLabel(adminDashboardLabels.successfully)}`);
        fetchDashboardData();
      } else {
        const data = await response.json();
        console.error('Error response:', data);
        toast.error(data.message || getLabel(adminDashboardLabels.failedToUpdateNewsStatus));
      }
    } catch (error) {
      console.error('Error updating news status:', error);
      toast.error(getLabel(adminDashboardLabels.errorUpdatingNewsStatus));
    }
  };

  // Returns a badge component for news status.
  const getNewsStatusBadge = (status) => {
    // Returns a styled badge for news status (active/inactive/draft).
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', text: 'Inactive' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Draft' }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Marquee management functions
  const fetchMarqueeText = async () => {
    try {
      const response = await fetch(`/marquee`);
      const data = await response.json();
      setMarqueeText(data.result || '');
    } catch (error) {
      console.error('Error fetching marquee:', error);
      setMarqueeText('');
    }
  };

  const handleUpdateMarquee = async () => {
    setMarqueeLoading(true);
    setMarqueeError('');
    setMarqueeSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/marquee`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: marqueeText })
      });

      const data = await response.json();
      if (response.ok) {
        setMarqueeSuccess('Marquee updated successfully!');
        setTimeout(() => setMarqueeSuccess(''), 3000);
      } else {
        setMarqueeError(data.message || 'Failed to update marquee');
      }
    } catch (error) {
      setMarqueeError('An error occurred while updating marquee');
    } finally {
      setMarqueeLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
              <h1 className="text-4xl font-extrabold text-nepal-blue tracking-tight animate-fade-in-down">{getLabel(adminDashboardLabels.adminDashboard)}</h1>
              <p className="mt-2 text-base text-gray-500 animate-fade-in">{`${getLabel(adminDashboardLabels.welcomeBack)}, ${user?.name || 'Admin'}`}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-5 py-2 border border-gray-200 text-base font-semibold rounded-lg text-nepal-blue bg-white hover:bg-blue-50 shadow transition-all duration-200 animate-fade-in"
              >
                <FaUsers className="mr-2" />
                {getLabel(adminDashboardLabels.userDashboard)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 shadow-xl rounded-2xl p-6 flex items-center gap-4 animate-fade-in-up">
            <div className="flex-shrink-0 bg-white rounded-full p-3 shadow">
              <FaUsers className="h-7 w-7 text-nepal-blue" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500">{getLabel(adminDashboardLabels.totalUsers)}</div>
              <div className="text-2xl font-bold text-nepal-blue">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 shadow-xl rounded-2xl p-6 flex items-center gap-4 animate-fade-in-up delay-75">
            <div className="flex-shrink-0 bg-white rounded-full p-3 shadow">
              <FaCheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500">{getLabel(adminDashboardLabels.activeUsers)}</div>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl rounded-2xl p-6 flex items-center gap-4 animate-fade-in-up delay-100">
            <div className="flex-shrink-0 bg-white rounded-full p-3 shadow">
              <FaCar className="h-7 w-7 text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500">{getLabel(adminDashboardLabels.totalBluebooks)}</div>
              <div className="text-2xl font-bold text-gray-700">{stats.totalBluebooks}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-xl rounded-2xl p-6 flex items-center gap-4 animate-fade-in-up delay-150">
            <div className="flex-shrink-0 bg-white rounded-full p-3 shadow">
              <FaClock className="h-7 w-7 text-yellow-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500">{getLabel(adminDashboardLabels.pending)}</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingBluebooks}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-200 to-green-300 shadow-xl rounded-2xl p-6 flex items-center gap-4 animate-fade-in-up delay-200">
            <div className="flex-shrink-0 bg-white rounded-full p-3 shadow">
              <FaCheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500">{getLabel(adminDashboardLabels.verified)}</div>
              <div className="text-2xl font-bold text-green-700">{stats.verifiedBluebooks}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/90 shadow-2xl rounded-2xl animate-fade-in-up">
          <div className="border-b border-gray-100">
            <nav className="-mb-px flex flex-wrap space-x-4 px-8 py-2">
              {[
                { key: 'overview', icon: <FaChartBar className="inline mr-2" />, label: getLabel(adminDashboardLabels.overview) },
                { key: 'users', icon: <FaUsers className="inline mr-2" />, label: `${getLabel(adminDashboardLabels.users)} (${users.length})` },
                { key: 'pending', icon: <FaClock className="inline mr-2" />, label: `${getLabel(adminDashboardLabels.pendingVerification)} (${pendingBluebooks.length})` },
                { key: 'bluebooks', icon: <FaCar className="inline mr-2" />, label: `${getLabel(adminDashboardLabels.allBluebooks)} (${bluebooks.length})` },
                { key: 'payments', icon: <FaMoneyBillWave className="inline mr-2" />, label: `${getLabel(adminDashboardLabels.payments)} (${payments.length})` },
                { key: 'reports', icon: <FaFileAlt className="inline mr-2" />, label: getLabel(adminDashboardLabels.reports) },
                { key: 'news', icon: <FaNewspaper className="inline mr-2" />, label: `${getLabel(adminDashboardLabels.news)} (${news.length})` },
                { key: 'marquee', icon: <FaNewspaper className="inline mr-2" />, label: getLabel(adminDashboardLabels.marquee) },
                { key: 'settings', icon: <FaCog className="inline mr-2" />, label: getLabel(adminDashboardLabels.settings) }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 px-4 border-b-4 font-semibold text-base transition-all duration-200 ${activeTab === tab.key
                    ? 'border-nepal-blue text-nepal-blue bg-blue-50 shadow'
                    : 'border-transparent text-gray-500 hover:text-nepal-blue hover:border-nepal-blue'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg animate-fade-in-up">
                    <h3 className="text-xl font-bold text-nepal-blue mb-6">{getLabel(adminDashboardLabels.recentPendingBluebooks)}</h3>
                    <div className="space-y-4">
                      {pendingBluebooks.slice(0, 5).map((bluebook, idx) => (
                        <div
                          key={bluebook._id}
                          className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:scale-[1.02] transition-transform duration-200 animate-fade-in-up"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {bluebook.vehicleRegNo}
                              {bluebook.isElectric && (
                                <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <FaBatteryFull className="mr-1" />
                                  {getLabel(adminDashboardLabels.electric)}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{bluebook.vehicleOwnerName}</p>
                          </div>
                          <button
                            onClick={() => handleVerifyBluebook(bluebook._id, bluebook.isElectric)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-semibold rounded-lg text-white bg-nepal-blue hover:bg-blue-700 shadow transition"
                          >
                            <FaCheckCircle className="mr-1" />
                            {getLabel(adminDashboardLabels.verify)}
                          </button>
                        </div>
                      ))}
                      {pendingBluebooks.length === 0 && (
                        <p className="text-gray-400 text-center py-6">{getLabel(adminDashboardLabels.noPendingBluebooks)}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-lg animate-fade-in-up delay-100">
                    <h3 className="text-xl font-bold text-green-700 mb-6">{getLabel(adminDashboardLabels.recentUsers)}</h3>
                    <div className="space-y-4">
                      {users.slice(0, 5).map((user, idx) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:scale-[1.02] transition-transform duration-200 animate-fade-in-up"
                          style={{ animationDelay: `${idx * 60}ms` }}
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getUserStatusBadge(user.status)}
                            {getUserRoleBadge(user.role)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* <button
                    onClick={() => setShowCreateAdminModal(true)}
                    className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-nepal-blue to-blue-500 hover:from-blue-700 hover:to-nepal-blue shadow transition"
                  >
                    <FaUserPlus className="mr-2" />
                    Create Admin
                  </button> */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={getLabel(adminDashboardLabels.searchUsers)}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 shadow"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 shadow"
                    >
                      <option value="all">{getLabel(adminDashboardLabels.allStatus)}</option>
                      <option value="active">{getLabel(adminDashboardLabels.active)}</option>
                      <option value="inactive">{getLabel(adminDashboardLabels.inactive)}</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white/90 shadow-xl overflow-hidden sm:rounded-2xl animate-fade-in-up">
                  <ul className="divide-y divide-gray-100">
                    {filteredUsers.map((user, idx) => (
                      <li key={user._id} className="px-8 py-5 hover:bg-blue-50 transition animate-fade-in-up" style={{ animationDelay: `${idx * 30}ms` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {user.image ? (
                                <img
                                  className="h-12 w-12 rounded-full border-2 border-nepal-blue shadow"
                                  src={`${import.meta.env.VITE_API_URL}/public/uploads/users/${user.image}`}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                  <FaUsers className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-5">
                              <div className="text-base font-semibold text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">Citizenship: {user.citizenshipNo}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getUserStatusBadge(user.status)}
                              {getUserRoleBadge(user.role)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewUserDetails(user)}
                                className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 shadow"
                              >
                                <FaEye className="mr-1" />
                                {getLabel(adminDashboardLabels.view)}
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 shadow"
                              >
                                <FaEdit className="mr-1" />
                                {getLabel(adminDashboardLabels.edit)}
                              </button>
                              <button
                                onClick={() => handleUpdateUserStatus(user._id, user.status === 'active' ? 'inactive' : 'active')}
                                className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg shadow ${user.status === 'active'
                                  ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                  : 'text-green-700 bg-green-100 hover:bg-green-200'
                                  }`}
                              >
                                {user.status === 'active' ? <FaToggleOff className="mr-1" /> : <FaToggleOn className="mr-1" />}
                                {user.status === 'active' ? getLabel(adminDashboardLabels.deactivate) : getLabel(adminDashboardLabels.activate)}
                              </button>
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 shadow"
                                >
                                  <FaTrash className="mr-1" />
                                  {getLabel(adminDashboardLabels.delete)}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Pending Bluebooks Tab */}
            {activeTab === 'pending' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white/90 shadow-xl overflow-hidden sm:rounded-2xl animate-fade-in-up">
                  <ul className="divide-y divide-gray-100">
                    {pendingBluebooks.map((bluebook, idx) => (
                      <li key={bluebook._id} className="px-8 py-5 hover:bg-yellow-50 transition animate-fade-in-up" style={{ animationDelay: `${idx * 30}ms` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-14 w-14">
                              <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-300 shadow">
                                <FaCar className="h-7 w-7 text-yellow-600" />
                              </div>
                            </div>
                            <div className="ml-5">
                              <div className="text-base font-semibold text-gray-900">{bluebook.vehicleRegNo}</div>
                              <div className="text-sm text-gray-500">{bluebook.vehicleOwnerName}</div>
                              <div className="text-xs text-gray-400">{bluebook.vehicleType} - {bluebook.vehicleModel}</div>
                              <div className="text-xs text-gray-400">{getLabel(adminDashboardLabels.created)}: {formatDate(bluebook.createdAt)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(bluebook.status)}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditBluebook(bluebook)}
                                className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 shadow"
                              >
                                <FaEdit className="mr-1" />
                                {getLabel(adminDashboardLabels.edit)}
                              </button>
                              <button
                                onClick={() => handleVerifyBluebook(bluebook._id, bluebook.isElectric)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-white bg-nepal-blue hover:bg-blue-700 shadow"
                              >
                                <FaCheckCircle className="mr-1" />
                                {getLabel(adminDashboardLabels.verify)}
                              </button>
                              <button
                                onClick={() => handleRejectBluebook(bluebook._id, bluebook.isElectric)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 shadow"
                              >
                                <FaTimesCircle className="mr-1" />
                                {getLabel(adminDashboardLabels.reject)}
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                    {pendingBluebooks.length === 0 && (
                      <li className="px-8 py-12 text-center text-gray-400 animate-fade-in">
                        {getLabel(adminDashboardLabels.noPendingToVerify)}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* All Bluebooks Tab */}
            {activeTab === 'bluebooks' && (
              <div className="space-y-6 animate-fade-in">
                {/* Search Bar */}
                                                    <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-nepal-blue">{getLabel(adminDashboardLabels.allBluebooks)}</h3>
                  <div className="flex items-center space-x-4">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder={getLabel(adminDashboardLabels.searchBluebooks)}
                          value={bluebookSearchTerm}
                          onChange={(e) => setBluebookSearchTerm(e.target.value)}
                          className="pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 shadow min-w-80"
                        />
                        {bluebookSearchTerm && (
                          <button
                            onClick={() => setBluebookSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                            title="Clear search"
                          >
                            <FaTimesCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getLabel(adminDashboardLabels.showing)} {filteredBluebooks.length} {getLabel(adminDashboardLabels.of)} {bluebooks.length} {getLabel(adminDashboardLabels.bluebooks).toLowerCase()}
                      </div>
                    </div>
                </div>

                <div className="bg-white/90 shadow-xl overflow-hidden sm:rounded-2xl animate-fade-in-up">
                  <ul className="divide-y divide-gray-100">
                    {filteredBluebooks.length > 0 ? (
                      filteredBluebooks.map((bluebook, idx) => (
                      <li key={bluebook._id} className="px-8 py-5 hover:bg-green-50 transition animate-fade-in-up" style={{ animationDelay: `${idx * 30}ms` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-14 w-14">
                              <div className={`h-14 w-14 rounded-full flex items-center justify-center border-2 shadow ${bluebook.status === 'verified' ? 'bg-green-100 border-green-300' :  bluebook.status === 'rejected' ? 'bg-red-100 border-red-300' : 'bg-yellow-100 border-yellow-300'
                                }`}>
                                {
                                  bluebook.isElectric ? (
                                    <FaBatteryFull className={`h-7 w-7 ${bluebook.status === 'verified' ? 'text-green-600' :  bluebook.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                      }`} />
                                  ) : bluebook.vehicleType === 'Car' ? (
                                    <FaCar className={`h-7 w-7 ${bluebook.status === 'verified' ? 'text-green-600' :  bluebook.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                      }`} />
                                  ) : (
                                    <FaMotorcycle className={`h-7 w-7 ${bluebook.status === 'verified' ? 'text-green-600' :  bluebook.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                      }`} />
                                  )
                                }
                              </div>
                            </div>
                            <div className="ml-5">
                              <div className="text-base font-semibold text-gray-900">{bluebook.vehicleRegNo}</div>
                              <div className="text-sm text-gray-500">{bluebook.vehicleOwnerName}</div>
                              <div className="text-xs text-gray-400">
                                {bluebook.vehicleType} - {bluebook.vehicleModel || bluebook.VehicleModel || 'N/A'}
                                {bluebook.isElectric && (
                                  <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <FaBatteryFull className="mr-1" />
                                    {getLabel(adminDashboardLabels.electric)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">{getLabel(adminDashboardLabels.created)}: {formatDate(bluebook.createdAt)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(bluebook.status)}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditBluebook(bluebook)}
                                className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 shadow"
                              >
                                <FaEdit className="mr-1" />
                                {getLabel(adminDashboardLabels.edit)}
                              </button>
                              {bluebook.status === 'pending' && (
                                <button
                                  onClick={() => handleVerifyBluebook(bluebook._id, bluebook.isElectric)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-white bg-nepal-blue hover:bg-blue-700 shadow"
                                >
                                  <FaCheckCircle className="mr-1" />
                                  {getLabel(adminDashboardLabels.verify)}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                    ) : (
                      <li className="px-8 py-12 text-center text-gray-400 animate-fade-in">
                        {bluebooks.length === 0 ? getLabel(adminDashboardLabels.noBluebooksFound) : `${getLabel(adminDashboardLabels.noBluebooksMatch)} "${bluebookSearchTerm}"`}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6 animate-fade-in">
                {/* Payment Statistics */}
                
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-nepal-blue">{getLabel(adminDashboardLabels.paymentTransactions)}</h3>
                  <div className="flex items-center space-x-4">
                    <select 
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 shadow"
                    >
                      <option value="all">{getLabel(adminDashboardLabels.allPayments)}</option>
                      <option value="successful">{getLabel(adminDashboardLabels.successful)}</option>
                      <option value="pending">{getLabel(adminDashboardLabels.pending)}</option>
                      <option value="failed">{getLabel(adminDashboardLabels.failed)}</option>
                      
                    </select>
                    <div className="text-sm text-gray-600">
                      {getLabel(adminDashboardLabels.showing)} {filteredPayments.length} {getLabel(adminDashboardLabels.of)} {payments.length} {getLabel(adminDashboardLabels.payments).toLowerCase()}
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 shadow-xl overflow-hidden sm:rounded-2xl animate-fade-in-up">
                  <div className="px-8 py-5 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100 rounded-t-2xl">
                    <div className="grid grid-cols-12 gap-4 text-base font-semibold text-nepal-blue">
                      <div className="col-span-3">{getLabel(adminDashboardLabels.transactionId)}</div>
                      <div className="col-span-2">{getLabel(adminDashboardLabels.user)}</div>
                      <div className="col-span-2">{getLabel(adminDashboardLabels.amount)}</div>
                      <div className="col-span-2">{getLabel(adminDashboardLabels.status)}</div>
                      <div className="col-span-2">{getLabel(adminDashboardLabels.date)}</div>
                      <div className="col-span-1">{getLabel(adminDashboardLabels.actions)}</div>
                    </div>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment, idx) => (
                        <li key={payment._id} className="px-8 py-5 animate-fade-in-up" style={{ animationDelay: `${idx * 30}ms` }}>
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 text-base font-semibold text-gray-900 break-all">{payment.transactionId}</div>
                            <div className="col-span-2 text-base text-gray-500 truncate" title={payment.userName}>{payment.userName}</div>
                            <div className="col-span-2 text-base font-bold text-green-600">Rs. {payment.amount}</div>
                            <div className="col-span-2 text-base">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow ${payment.status === 'successful' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {payment.status}
                              </span>
                            </div>
                            <div className="col-span-2 text-base text-gray-400 truncate" title={formatDate(payment.createdAt)}>{formatDate(payment.createdAt)}</div>
                            <div className="col-span-1 flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewPayment(payment)}
                                className="text-nepal-blue hover:text-blue-700 transition p-1 rounded hover:bg-blue-50"
                                title="View Payment Details"
                              >
                                <FaEye className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleDownloadPayment(payment)}
                                className="text-green-600 hover:text-green-700 transition p-1 rounded hover:bg-green-50"
                                title="Download Receipt"
                              >
                                <FaDownload className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-8 py-12 text-center text-gray-400 animate-fade-in">
                        {payments.length === 0 ? getLabel(adminDashboardLabels.noPaymentsFound) : `${getLabel(adminDashboardLabels.noPaymentsMatch)} "${paymentFilter}"`}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg animate-fade-in-up">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-white rounded-full p-4 shadow">
                        <FaUsers className="h-8 w-8 text-nepal-blue" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-bold text-nepal-blue">{getLabel(adminDashboardLabels.userReport)}</h3>
                        <p className="text-sm text-gray-500">{getLabel(adminDashboardLabels.generateUserStats)}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => generateReport('users')}
                        className="w-full bg-gradient-to-r from-nepal-blue to-blue-500 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-nepal-blue shadow transition"
                      >
                        {getLabel(adminDashboardLabels.generateReport)}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg animate-fade-in-up delay-75">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-white rounded-full p-4 shadow">
                        <FaCar className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-bold text-green-700">{getLabel(adminDashboardLabels.bluebookReport)}</h3>
                        <p className="text-sm text-gray-500">{getLabel(adminDashboardLabels.generateBluebookStats)}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => generateReport('bluebooks')}
                        className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-500 shadow transition"
                      >
                        {getLabel(adminDashboardLabels.generateReport)}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg animate-fade-in-up delay-150">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-white rounded-full p-4 shadow">
                        <FaMoneyBillWave className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-bold text-yellow-700">{getLabel(adminDashboardLabels.paymentReport)}</h3>
                        <p className="text-sm text-gray-500">{getLabel(adminDashboardLabels.generatePaymentStats)}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => generateReport('payments')}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-yellow-400 shadow transition"
                      >
                        {getLabel(adminDashboardLabels.generateReport)}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 p-8 rounded-2xl shadow-xl animate-fade-in-up">
                  <h3 className="text-xl font-bold text-nepal-blue mb-6">{getLabel(adminDashboardLabels.systemAnalytics)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-xl shadow">
                      <div className="text-3xl font-extrabold text-nepal-blue">{stats.totalUsers}</div>
                      <div className="text-base text-gray-600">{getLabel(adminDashboardLabels.totalUsers)}</div>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-xl shadow">
                      <div className="text-3xl font-extrabold text-green-600">{stats.totalBluebooks}</div>
                      <div className="text-base text-gray-600">{getLabel(adminDashboardLabels.totalBluebooks)}</div>
                    </div>
                    <div className="text-center p-6 bg-yellow-50 rounded-xl shadow">
                      <div className="text-3xl font-extrabold text-yellow-600">{stats.pendingBluebooks}</div>
                      <div className="text-base text-gray-600">{getLabel(adminDashboardLabels.pending)}</div>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-xl shadow">
                      <div className="text-3xl font-extrabold text-purple-600">{payments.length}</div>
                      <div className="text-base text-gray-600">{getLabel(adminDashboardLabels.payments)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* News Tab */}
            {activeTab === 'news' && (
              <div className="space-y-8 animate-fade-in">
                {/* Header Section */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <FaNewspaper className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{getLabel(adminDashboardLabels.newsManagement)}</h2>
                      <p className="text-gray-600">{getLabel(adminDashboardLabels.manageNewsArticles)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewsModal(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <FaPlus className="mr-2" />
                    {getLabel(adminDashboardLabels.addNews)}
                  </button>
                </div>

                {/* News List */}
                <div className="bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden rounded-3xl border border-gray-100 animate-fade-in-up">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{getLabel(adminDashboardLabels.newsArticles)} ({news.length})</h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {news.map((newsItem, idx) => (
                      <li key={newsItem._id} className="px-8 py-8 animate-fade-in-up hover:bg-gray-50/50 transition-all duration-200" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                          <div className="flex items-start space-x-6 w-full lg:w-auto">
                            <div className="flex-shrink-0 relative group">
                              {newsItem.image ? (
                                <img
                                  className="w-[240px] h-[160px] object-cover rounded-2xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
                                  src={`${import.meta.env.VITE_API_URL}/public/uploads/news/${newsItem.image}`}
                                  alt={newsItem.title}
                                  onError={e => { e.target.onerror = null; e.target.src = fallbackNews; }}
                                />
                              ) : (
                                <img
                                  className="w-[240px] h-[160px] object-cover rounded-2xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105"
                                  src="https://via.placeholder.com/400x250?text=No+Image"
                                  alt="No news image"
                                />
                              )}
                              <div className="absolute top-3 left-3">
                                {getNewsStatusBadge(newsItem.status)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 space-y-3">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{newsItem.title}</h4>
                                <p className="text-gray-600 leading-relaxed line-clamp-3">{newsItem.content.substring(0, 150)}...</p>
                              </div>
                              <div className="flex items-center space-x-4 pt-2">
                                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                                  <span className="text-xs font-medium text-blue-700">{getLabel(adminDashboardLabels.priority)}: {newsItem.priority}</span>
                                </div>
                                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-full">
                                  <span className="text-xs font-medium text-gray-600">{getLabel(adminDashboardLabels.created)}: {formatDate(newsItem.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 lg:flex-col lg:space-x-0 lg:space-y-3">
                            <button
                              onClick={() => handleEditNews(newsItem)}
                              className="inline-flex items-center px-4 py-2 border border-blue-200 text-sm font-medium rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 shadow-sm transition-all duration-200 transform hover:scale-105"
                            >
                              <FaEdit className="mr-2" />
                              {getLabel(adminDashboardLabels.edit)}
                            </button>
                            <button
                              onClick={() => handleUpdateNewsStatus(newsItem._id, newsItem.status === 'active' ? 'inactive' : 'active')}
                              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm transition-all duration-200 transform hover:scale-105 ${newsItem.status === 'active'
                                ? 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
                                : 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200'
                                }`}
                            >
                              {newsItem.status === 'active' ? <FaToggleOff className="mr-2" /> : <FaToggleOn className="mr-2" />}
                              {newsItem.status === 'active' ? getLabel(adminDashboardLabels.deactivate) : getLabel(adminDashboardLabels.activate)}
                            </button>
                            <button
                              onClick={() => handleDeleteNews(newsItem)}
                              className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 shadow-sm transition-all duration-200 transform hover:scale-105"
                            >
                              <FaTrash className="mr-2" />
                              {getLabel(adminDashboardLabels.delete)}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                    {news.length === 0 && (
                      <li className="px-8 py-16 text-center">
                        <div className="max-w-md mx-auto">
                          <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FaNewspaper className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">{getLabel(adminDashboardLabels.noNewsArticles)}</h3>
                          <p className="text-gray-500 mb-4">{getLabel(adminDashboardLabels.getStartedNews)}</p>
                          <button
                            onClick={() => setShowNewsModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <FaPlus className="mr-2" />
                            {getLabel(adminDashboardLabels.createFirstArticle)}
                          </button>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Marquee Tab */}
            {activeTab === 'marquee' && (
              <div className="space-y-8 animate-fade-in">
                {/* Header Section */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <FaFileAlt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{getLabel(adminDashboardLabels.marqueeManagement)}</h2>
                      <p className="text-gray-600">{getLabel(adminDashboardLabels.marqueeDescription)}</p>
                    </div>
                  </div>
                </div>

                {/* Marquee Form */}
                <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border border-gray-100 animate-fade-in-up overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-purple-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{getLabel(adminDashboardLabels.announcementBanner)}</h3>
                    <p className="text-gray-600">{getLabel(adminDashboardLabels.marqueeScrollNote)}.</p>
                  </div>
                  
                  <form
                    onSubmit={e => { e.preventDefault(); handleUpdateMarquee(); }}
                    className="p-8 space-y-6"
                  >
                    <div className="space-y-3">
                      <label className="block text-lg font-semibold text-gray-700 mb-3">
                        <span className="flex items-center space-x-2">
                          <FaFileAlt className="text-purple-500" />
                          <span>{getLabel(adminDashboardLabels.marqueeText)}</span>
                        </span>
                      </label>
                      <textarea
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 bg-gray-50 text-lg shadow-sm transition-all duration-200 resize-none"
                        rows={4}
                        value={marqueeText}
                        onChange={e => setMarqueeText(e.target.value)}
                        placeholder="Enter announcement text that will display at the top of the website..."
                        required
                      />
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>{getLabel(adminDashboardLabels.marqueeScrollNote)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="submit"
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={marqueeLoading}
                      >
                        {marqueeLoading ? (
                          <span className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{getLabel(adminDashboardLabels.saving)}</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-2">
                            <FaFileAlt />
                            <span>{getLabel(adminDashboardLabels.saveMarquee)}</span>
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {marqueeError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center animate-fade-in-up">
                        <div className="flex items-center justify-center space-x-2">
                          <FaExclamationTriangle />
                          <span>{marqueeError}</span>
                        </div>
                      </div>
                    )}
                    {marqueeSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-center animate-fade-in-up">
                        <div className="flex items-center justify-center space-x-2">
                          <FaCheckCircle />
                          <span>{marqueeSuccess}</span>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg animate-fade-in-up">
                    <h3 className="text-xl font-bold text-nepal-blue mb-6">{getLabel(adminDashboardLabels.systemSettings)}</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">
                          {getLabel(adminDashboardLabels.autoVerifyBluebooks)}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-5 w-5 text-nepal-blue focus:ring-nepal-blue border-gray-300 rounded transition"
                          />
                          <span className="ml-3 text-base text-gray-600">{getLabel(adminDashboardLabels.enableAutoVerification)}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">
                          {getLabel(adminDashboardLabels.emailNotifications)}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-5 w-5 text-nepal-blue focus:ring-nepal-blue border-gray-300 rounded transition"
                          />
                          <span className="ml-3 text-base text-gray-600">{getLabel(adminDashboardLabels.sendEmailNotifications)}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">
                          {getLabel(adminDashboardLabels.maintenanceMode)}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-5 w-5 text-nepal-blue focus:ring-nepal-blue border-gray-300 rounded transition"
                          />
                          <span className="ml-3 text-base text-gray-600">{getLabel(adminDashboardLabels.enableMaintenanceMode)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <button className="bg-gradient-to-r from-nepal-blue to-blue-500 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-nepal-blue shadow transition">
                        {getLabel(adminDashboardLabels.saveSettings)}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg animate-fade-in-up delay-100">
                    <h3 className="text-xl font-bold text-green-700 mb-6">{getLabel(adminDashboardLabels.adminActions)}</h3>
                    <div className="space-y-4">
                      <button
                        className="w-full text-left p-4 border border-gray-100 rounded-xl hover:bg-green-50 transition flex items-center gap-4 shadow"
                        onClick={() => setShowCreateAdminModal(true)}
                      >
                        <FaUserPlus className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{getLabel(adminDashboardLabels.createNewAdmin)}</div>
                          <div className="text-sm text-gray-500">{getLabel(adminDashboardLabels.addAdminDescription)}</div>
                        </div>
                      </button>
                      <button className="w-full text-left p-4 border border-gray-100 rounded-xl hover:bg-yellow-50 transition flex items-center gap-4 shadow">
                        <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{getLabel(adminDashboardLabels.systemBackup)}</div>
                          <div className="text-sm text-gray-500">{getLabel(adminDashboardLabels.createSystemBackup)}</div>
                        </div>
                      </button>
                      <button className="w-full text-left p-4 border border-gray-100 rounded-xl hover:bg-blue-50 transition flex items-center gap-4 shadow">
                        <FaCog className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{getLabel(adminDashboardLabels.databaseMaintenance)}</div>
                          <div className="text-sm text-gray-500">{getLabel(adminDashboardLabels.optimizeDatabase)}</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 p-8 rounded-2xl shadow-xl animate-fade-in-up">
                  <h3 className="text-xl font-bold text-nepal-blue mb-6">{getLabel(adminDashboardLabels.systemInformation)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-base font-semibold text-gray-500">{getLabel(adminDashboardLabels.serverStatus)}</div>
                      <div className="text-base text-green-600 font-bold">{getLabel(adminDashboardLabels.online)}</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-500">{getLabel(adminDashboardLabels.databaseStatus)}</div>
                      <div className="text-base text-green-600 font-bold">{getLabel(adminDashboardLabels.connected)}</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-500">{getLabel(adminDashboardLabels.lastBackup)}</div>
                      <div className="text-base text-gray-900">2 hours ago</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-500">{getLabel(adminDashboardLabels.systemVersion)}</div>
                      <div className="text-base text-gray-900">v1.0.0</div>
                    </div>
                  </div>
                </div>


              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modals remain unchanged */}
      {/* ... */}
      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setShowUserModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              {selectedUser.image ? (
                <img
                  className="h-24 w-24 rounded-full border-4 border-nepal-blue shadow mb-4"
                  src={`${import.meta.env.VITE_API_URL}/public/uploads/users/${selectedUser.image}`}
                  alt={selectedUser.name}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 mb-4">
                  <FaUsers className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-nepal-blue mb-1">{selectedUser.name}</h2>
              <div className="flex items-center space-x-2 mb-2">
                {getUserStatusBadge(selectedUser.status)}
                {getUserRoleBadge(selectedUser.role)}
              </div>
              <div className="w-full mt-4 space-y-2">
                <div className="flex items-center text-gray-700">
                  <FaEnvelope className="mr-2 text-nepal-blue" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaNewspaper className="mr-2 text-nepal-blue" />
                  <span>{getLabel(adminDashboardLabels.citizenshipNo)}: {selectedUser.citizenshipNo || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FaCalendarAlt className="mr-2 text-nepal-blue" />
                  <span>{getLabel(adminDashboardLabels.joined)}: {formatDate(selectedUser.createdAt)}</span>
                </div>
                {/* Add more fields as needed */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setShowEditModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-nepal-blue mb-6">{getLabel(adminDashboardLabels.editUser)}</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleUpdateUser();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">{getLabel(adminDashboardLabels.name)}</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">{getLabel(adminDashboardLabels.email)}</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">{getLabel(adminDashboardLabels.citizenshipNo)}</label>
                <input
                  type="text"
                  name="citizenshipNo"
                  value={editFormData.citizenshipNo}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">{getLabel(adminDashboardLabels.role)}</label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50"
                >
                  <option value="user">{getLabel(adminDashboardLabels.user)}</option>
                  <option value="admin">{getLabel(adminDashboardLabels.admin)}</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">{getLabel(adminDashboardLabels.status)}</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50"
                >
                  <option value="active">{getLabel(adminDashboardLabels.active)}</option>
                  <option value="inactive">{getLabel(adminDashboardLabels.inactive)}</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  {getLabel(adminDashboardLabels.cancel)}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-nepal-blue text-white font-semibold hover:bg-blue-700"
                >
                  {getLabel(adminDashboardLabels.saveChanges)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete User Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
              <h2 className="text-2xl font-bold text-nepal-blue mb-2">{getLabel(adminDashboardLabels.deleteUser)}</h2>
              <p className="text-gray-700 mb-6 text-center">
                {getLabel(adminDashboardLabels.deleteUserConfirm)} <span className="font-semibold">{userToDelete.name}</span>? {getLabel(adminDashboardLabels.cannotBeUndone)}
              </p>
              <div className="flex justify-end space-x-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  {getLabel(adminDashboardLabels.cancel)}
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  {getLabel(adminDashboardLabels.delete)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Bluebook Modal */}
      {showEditBluebookModal && editingBluebook && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 relative animate-fade-in-up scale-95 sm:scale-100 transition-transform duration-300">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-nepal-blue rounded-lg">
                    <FaCar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-nepal-blue">{getLabel(adminDashboardLabels.editBluebook)}</h2>
                    <p className="text-sm text-gray-600">{getLabel(adminDashboardLabels.updateVehicleInfo)}</p>
                  </div>
                </div>
                <button
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                  onClick={() => setShowEditBluebookModal(false)}
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleUpdateBluebook();
                }}
                className="space-y-6"
              >
                {/* Vehicle Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaCar className="mr-2 text-nepal-blue" />
                    {getLabel(adminDashboardLabels.vehicleInformation)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.vehicleRegNo)}</label>
                      <input
                        type="text"
                        name="vehicleRegNo"
                        value={editBluebookFormData.vehicleRegNo}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.ownerName)}</label>
                      <input
                        type="text"
                        name="vehicleOwnerName"
                        value={editBluebookFormData.vehicleOwnerName}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.vehicleType)}</label>
                      <input
                        type="text"
                        name="vehicleType"
                        value={editBluebookFormData.vehicleType}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.model)}</label>
                      <input
                        type="text"
                        name="vehicleModel"
                        value={editBluebookFormData.vehicleModel}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.manufactureYear)}</label>
                      <input
                        type="text"
                        name="manufactureYear"
                        value={editBluebookFormData.manufactureYear}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.chassisNo)}</label>
                      <input
                        type="text"
                        name="chasisNumber"
                        value={editBluebookFormData.chasisNumber}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.color)}</label>
                      <input
                        type="text"
                        name="vehicleColor"
                        value={editBluebookFormData.vehicleColor}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.engineCC)}</label>
                      <input
                        type="text"
                        name="vehicleEngineCC"
                        value={editBluebookFormData.vehicleEngineCC}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.vehicleNumber)}</label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={editBluebookFormData.vehicleNumber}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.status)}</label>
                      <select
                        name="status"
                        value={editBluebookFormData.status}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      >
                        <option value="pending">{getLabel(adminDashboardLabels.pending)}</option>
                        <option value="verified">{getLabel(adminDashboardLabels.verified)}</option>
                        <option value="rejected">{getLabel(adminDashboardLabels.rejected)}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.vehicleRegistrationDate)}</label>
                      <input
                        type="date"
                        name="VehicleRegistrationDate"
                        value={editBluebookFormData.VehicleRegistrationDate}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.taxPayDate)}</label>
                      <input
                        type="date"
                        name="taxPayDate"
                        value={editBluebookFormData.taxPayDate}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{getLabel(adminDashboardLabels.taxExpireDate)}</label>
                      <input
                        type="date"
                        name="taxExpireDate"
                        value={editBluebookFormData.taxExpireDate}
                        onChange={handleEditBluebookFormChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditBluebookModal(false)}
                    className="px-6 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200 shadow-sm"
                  >
                    {getLabel(adminDashboardLabels.cancel)}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-nepal-blue to-blue-600 text-white font-semibold hover:from-blue-700 hover:to-nepal-blue transition-all duration-200 shadow-lg"
                  >
                    {getLabel(adminDashboardLabels.saveChanges)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showNewsModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in p-4">
    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-fade-in-up scale-95 sm:scale-100 transition-transform duration-300">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-100">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold transition-colors duration-200 z-10"
          onClick={() => {
            setShowNewsModal(false);
            setEditingNews(null);
            setNewsForm({
              title: '',
              content: '',
              status: 'draft',
              priority: 1,
              tags: []
            });
            setNewsImage(null);
          }}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-extrabold text-nepal-blue text-center tracking-tight animate-fade-in-down">
          {editingNews ? getLabel(adminDashboardLabels.editNews) : getLabel(adminDashboardLabels.addNews)}
        </h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 modal-scroll">
        <form
          id="newsForm"
          onSubmit={e => {
            e.preventDefault();
            editingNews ? handleUpdateNews() : handleCreateNews();
          }}
          className="space-y-6"
        >
        <div className="space-y-2 animate-fade-in-up">
          <label className="block text-base font-semibold text-gray-700">{getLabel(adminDashboardLabels.title)}</label>
          <input
            type="text"
            name="title"
            value={newsForm.title}
            onChange={handleNewsFormChange}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-base shadow-sm transition"
            required
            placeholder="Enter news title..."
            maxLength={200}
          />
          <div className="text-xs text-gray-400 text-right">
            {newsForm.title.length}/200 characters
          </div>
        </div>
        <div className="space-y-2 animate-fade-in-up delay-75">
          <label className="block text-base font-semibold text-gray-700">{getLabel(adminDashboardLabels.content)}</label>
          <textarea
            name="content"
            value={newsForm.content}
            onChange={handleNewsFormChange}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-base shadow-sm transition resize-none"
            rows={6}
            required
            placeholder="Write your news content here..."
            maxLength={2000}
          />
          <div className="text-xs text-gray-400 text-right">
            {newsForm.content.length}/2000 characters
          </div>
        </div>
        <div className="space-y-2 animate-fade-in-up delay-100">
          <label className="block text-base font-semibold text-gray-700">{getLabel(adminDashboardLabels.image)}</label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleNewsImageChange}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-nepal-blue file:text-white hover:file:bg-blue-700 transition"
            />
            {/* Image preview */}
            {(newsImage || (editingNews && editingNews.image)) && (
              <div className="flex justify-center animate-fade-in-up">
                <div className="relative group">
                  <img
                    src={newsImage ? URL.createObjectURL(newsImage) : `${import.meta.env.VITE_API_URL}/public/uploads/news/${editingNews.image}`}
                    alt="Preview"
                    className="w-64 h-40 object-cover rounded-xl border border-gray-200 shadow-md transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-200 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Preview</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-150">
          <div className="space-y-2">
            <label className="block text-base font-semibold text-gray-700">{getLabel(adminDashboardLabels.status)}</label>
            <select
              name="status"
              value={newsForm.status}
              onChange={handleNewsFormChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-base shadow-sm transition"
            >
              <option value="draft">📝 Draft</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-base font-semibold text-gray-700">{getLabel(adminDashboardLabels.priority)}</label>
            <input
              type="number"
              name="priority"
              value={newsForm.priority}
              onChange={handleNewsFormChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-base shadow-sm transition"
              min={1}
              max={10}
              placeholder="1-10"
            />
          </div>
        </div>
        </form>
      </div>
      
      {/* Fixed Footer */}
      <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-3xl">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowNewsModal(false)}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
            disabled={newsLoading}
          >
            {getLabel(adminDashboardLabels.cancel)}
          </button>
          <button
            type="submit"
            form="newsForm"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-nepal-blue to-blue-500 text-white font-bold shadow-lg hover:from-blue-700 hover:to-nepal-blue transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl transform hover:scale-105"
            disabled={newsLoading}
          >
            {newsLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                {editingNews ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {getLabel(adminDashboardLabels.saveChanges)}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {getLabel(adminDashboardLabels.addNews)}
                  </>
                )}
              </span>
            )}
          </button>
        </div>
        {newsError && (
          <div className="text-red-500 text-center animate-fade-in-up mt-3 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
            {newsError}
          </div>
        )}
        {newsSuccess && (
          <div className="text-green-500 text-center animate-fade-in-up mt-3 text-sm bg-green-50 p-2 rounded-lg border border-green-200">
            {newsSuccess}
          </div>
        )}
      </div>
    </div>
  </div>
)}
      {showCreateAdminModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative animate-fade-in-up">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold"
        onClick={() => setShowCreateAdminModal(false)}
        aria-label="Close"
      >
        &times;
      </button>
      <h2 className="text-3xl font-extrabold text-nepal-blue mb-8 text-center tracking-tight animate-fade-in-down">
        {getLabel(adminDashboardLabels.addNewAdmin)}
      </h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleCreateAdmin();
        }}
        className="space-y-6"
      >
        <div className="space-y-2 animate-fade-in-up">
          <label className="block text-base font-semibold text-gray-700 text-left">{getLabel(adminDashboardLabels.name)}</label>
          <input
            type="text"
            name="name"
            value={createAdminForm.name}
            onChange={handleCreateAdminFormChange}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-lg shadow-sm transition"
            required
            placeholder="Enter admin name..."
          />
        </div>
        <div className="space-y-2 animate-fade-in-up delay-75">
          <label className="block text-base font-semibold text-gray-700 text-left">{getLabel(adminDashboardLabels.email)}</label>
          <input
            type="email"
            name="email"
            value={createAdminForm.email}
            onChange={handleCreateAdminFormChange}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-lg shadow-sm transition"
            required
            placeholder="Enter admin email..."
          />
        </div>
        <div className="space-y-2 animate-fade-in-up delay-100">
          <label className="block text-base font-semibold text-gray-700 text-left">{getLabel(adminDashboardLabels.password)}</label>
          <input
            type="password"
            name="password"
            value={createAdminForm.password}
            onChange={handleCreateAdminFormChange}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-lg shadow-sm transition"
            required
            placeholder="Enter password..."
          />
        </div>
        <div className="space-y-2 animate-fade-in-up delay-50">
          <label className="block text-base font-semibold text-gray-700 text-left">{getLabel(adminDashboardLabels.citizenshipNo)}</label>
          <input
            type="text"
            name="citizenshipNo"
            value={createAdminForm.citizenshipNo}
            onChange={handleCreateAdminFormChange}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-lg shadow-sm transition"
            required
            placeholder="Enter citizenship number..."
          />
        </div>
        <div className="flex justify-end space-x-3 pt-6 animate-fade-in-up delay-200">
          <button
            type="button"
            onClick={() => setShowCreateAdminModal(false)}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
          >
            {getLabel(adminDashboardLabels.cancel)}
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-nepal-blue to-blue-500 text-white font-bold shadow-lg hover:from-blue-700 hover:to-nepal-blue transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={createAdminLoading}
          >
            {createAdminLoading ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>{getLabel(adminDashboardLabels.saving)}</span>
            ) : (
              getLabel(adminDashboardLabels.addAdmin)
            )}
          </button>
        </div>
        {createAdminError && <div className="text-red-500 text-center animate-fade-in-up mt-2">{createAdminError}</div>}
        {createAdminSuccess && <div className="text-green-500 text-center animate-fade-in-up mt-2">{createAdminSuccess}</div>}
      </form>
    </div>
  </div>
)}
      {showOtpModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative animate-fade-in-up">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold"
        onClick={() => { setShowOtpModal(false); setOtpValue(''); setOtpError(''); setOtpSuccess(''); }}
        aria-label="Close"
      >
        &times;
      </button>
      <h2 className="text-2xl font-extrabold text-nepal-blue mb-6 text-center">{getLabel(adminDashboardLabels.verifyAdminEmail)}</h2>
      <form
        onSubmit={async e => {
          e.preventDefault();
          setOtpLoading(true);
          setOtpError('');
          setOtpSuccess('');
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: pendingAdminUserId, otp: otpValue })
            });
            const data = await response.json();
            if (response.ok) {
              setOtpSuccess('Admin email verified and account activated!');
              setTimeout(() => {
                setShowOtpModal(false);
                setOtpValue('');
                setOtpError('');
                setOtpSuccess('');
                fetchDashboardData();
                toast.success(getLabel(adminDashboardLabels.adminRegistrationSuccess));
              }, 1200);
            } else {
              setOtpError(data.message || 'Invalid OTP or verification failed');
            }
          } catch (err) {
            setOtpError('An error occurred during OTP verification');
          } finally {
            setOtpLoading(false);
          }
        }}
        className="space-y-6"
      >
        <div className="space-y-2 animate-fade-in-up">
          <label className="block text-base font-semibold text-gray-700 text-left">{getLabel(adminDashboardLabels.enterOtp)}</label>
          <input
            type="text"
            name="otp"
            value={otpValue}
            onChange={e => setOtpValue(e.target.value)}
            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nepal-blue bg-gray-50 text-lg shadow-sm transition"
            required
            placeholder="Enter 6-digit OTP..."
            maxLength={6}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-6 animate-fade-in-up delay-200">
          <button
            type="button"
            onClick={() => { setShowOtpModal(false); setOtpValue(''); setOtpError(''); setOtpSuccess(''); }}
            className="px-6 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
          >
            {getLabel(adminDashboardLabels.cancel)}
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-nepal-blue to-blue-500 text-white font-bold shadow-lg hover:from-blue-700 hover:to-nepal-blue transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={otpLoading}
          >
            {otpLoading ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>{getLabel(adminDashboardLabels.verifying)}</span>
            ) : (
              getLabel(adminDashboardLabels.verifyOtp)
            )}
          </button>
        </div>
        {otpError && <div className="text-red-500 text-center animate-fade-in-up mt-2">{otpError}</div>}
        {otpSuccess && <div className="text-green-500 text-center animate-fade-in-up mt-2">{otpSuccess}</div>}
      </form>
    </div>
  </div>
)}

      {/* Delete News Confirmation Modal */}
      {showDeleteNewsModal && newsToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setShowDeleteNewsModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
              <h2 className="text-2xl font-bold text-nepal-blue mb-2">Delete News Article</h2>
              <p className="text-gray-700 mb-6 text-center">
                Are you sure you want to delete <span className="font-semibold">"{newsToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteNewsModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteNews}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-nepal-blue mb-2">Payment Details</h2>
                <p className="text-gray-600">Transaction Information</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Transaction ID</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedPayment.transactionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">User</label>
                    <p className="text-lg text-gray-900">{selectedPayment.userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                    <p className="text-lg font-bold text-green-600">Rs. {selectedPayment.amount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow ${
                      selectedPayment.status === 'successful' ? 'bg-green-100 text-green-800' :
                      selectedPayment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle Type</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-semibold shadow ${
                      selectedPayment.isElectric 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedPayment.isElectric ? (
                        <>
                          <FaBatteryFull className="h-3 w-3" />
                          Electric
                        </>
                      ) : (
                        <>
                          <FaMotorcycle className="h-3 w-3" />
                          Fuel
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Payment Date</label>
                <p className="text-lg text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => handleDownloadPayment(selectedPayment)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg hover:from-green-600 hover:to-green-700 transition flex items-center gap-2"
                >
                  <FaDownload className="h-4 w-4" />
                  Download Receipt
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default AdminDashboard;
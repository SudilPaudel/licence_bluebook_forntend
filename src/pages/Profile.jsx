import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaSave, FaTimes, FaCamera, FaArrowLeft, FaShieldAlt, FaUserTag, FaCheckCircle, FaClock, FaTimesCircle, FaIdCardAlt } from "react-icons/fa";
import CitizenshipInput from "../components/CitizenshipInput";
import { useLang } from "../context/LanguageContext";
import { profileLabels } from "../labels/profileLabels";

function Profile() {
  // Main component for displaying and editing user profile

  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [user, setUser] = useState(null);
  const [kycDetails, setKycDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [citizenshipNoError, setCitizenshipNoError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    citizenshipNo: ""
  });
  
  // State for KYC form data
  const [kycFormData, setKycFormData] = useState({
    fullName: "",
    fullNameNepali: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    province: "",
    district: "",
    municipality: "",
    wardNo: "",
    tole: "",
    citizenshipNo: "",
    citizenshipIssueDate: "",
    citizenshipIssueDistrict: "",
    fatherName: "",
    motherName: "",
    grandfatherName: ""
  });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // Helper function for KYC status badge
  const getKycStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
            <FaCheckCircle className="mr-1" /> {getLabel(profileLabels.verified)}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <FaClock className="mr-1" /> {getLabel(profileLabels.pendingReview)}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
            <FaTimesCircle className="mr-1" /> {getLabel(profileLabels.rejected)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            <FaIdCardAlt className="mr-1" /> {getLabel(profileLabels.notSubmitted)}
          </span>
        );
    }
  };

  const handleKycClick = () => {
    navigate('/kyc-form');
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   * Fetches the user's profile from the API and sets user and form data state.
   * Handles authentication and error state.
   */
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.result);
        setKycDetails(data.result.kycDetails);
        setFormData({
          name: data.result.name,
          email: data.result.email,
          citizenshipNo: data.result.citizenshipNo
        });
        // Initialize KYC form data if exists
        if (data.result.kycDetails) {
          setKycFormData({
            fullName: data.result.kycDetails.fullName || "",
            fullNameNepali: data.result.kycDetails.fullNameNepali || "",
            dateOfBirth: data.result.kycDetails.dateOfBirth || "",
            gender: data.result.kycDetails.gender || "",
            nationality: data.result.kycDetails.nationality || "",
            province: data.result.kycDetails.province || "",
            district: data.result.kycDetails.district || "",
            municipality: data.result.kycDetails.municipality || "",
            wardNo: data.result.kycDetails.wardNo || "",
            tole: data.result.kycDetails.tole || "",
            citizenshipIssueDate: data.result.kycDetails.citizenshipIssueDate || "",
            citizenshipIssueDistrict: data.result.kycDetails.citizenshipIssueDistrict || "",
            fatherName: data.result.kycDetails.fatherName || "",
            motherName: data.result.kycDetails.motherName || "",
            grandfatherName: data.result.kycDetails.grandfatherName || ""
          });
        }
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('An error occurred while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles input changes for profile form fields.
   * Updates formData state.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "citizenshipNo") setCitizenshipNoError("");
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle KYC form changes
  const handleKycChange = (e) => {
    const { name, value } = e.target;
    setKycFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input changes
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === 'frontImage') {
        setFrontImage(file);
      } else if (field === 'backImage') {
        setBackImage(file);
      }
    }
  };

  /**
   * Enables editing mode for the profile.
   * Clears error and success messages.
   */
  const handleEdit = () => {
    // Show warning if user has existing KYC
    if (user?.kycStatus && user?.kycStatus !== 'none') {
      setShowConfirmModal(true);
      return;
    }
    // Populate form data with existing user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      citizenshipNo: user.citizenshipNo || ''
    });
    // Populate KYC form data with existing KYC details
    if (user?.kycDetails) {
      setKycFormData({
        fullName: user.kycDetails.fullName || '',
        fullNameNepali: user.kycDetails.fullNameNepali || '',
        dateOfBirth: user.kycDetails.dateOfBirth || '',
        gender: user.kycDetails.gender || '',
        nationality: user.kycDetails.nationality || '',
        province: user.kycDetails.province || '',
        district: user.kycDetails.district || '',
        municipality: user.kycDetails.municipality || '',
        wardNo: user.kycDetails.wardNo || '',
        tole: user.kycDetails.tole || '',
        citizenshipNo: user.kycDetails.citizenshipNo || '',
        citizenshipIssueDate: user.kycDetails.citizenshipIssueDate || '',
        citizenshipIssueDistrict: user.kycDetails.citizenshipIssueDistrict || '',
        fatherName: user.kycDetails.fatherName || '',
        motherName: user.kycDetails.motherName || '',
        grandfatherName: user.kycDetails.grandfatherName || ''
      });
    }
    setEditing(true);
    setError("");
    setSuccess("");
  };

  /**
   * Confirms edit mode after modal confirmation.
   */
  const confirmEdit = () => {
    setShowConfirmModal(false);
    // Populate form data with existing user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      citizenshipNo: user.citizenshipNo || ''
    });
    // Populate KYC form data with existing KYC details
    if (user?.kycDetails) {
      setKycFormData({
        fullName: user.kycDetails.fullName || '',
        fullNameNepali: user.kycDetails.fullNameNepali || '',
        dateOfBirth: user.kycDetails.dateOfBirth || '',
        gender: user.kycDetails.gender || '',
        nationality: user.kycDetails.nationality || '',
        province: user.kycDetails.province || '',
        district: user.kycDetails.district || '',
        municipality: user.kycDetails.municipality || '',
        wardNo: user.kycDetails.wardNo || '',
        tole: user.kycDetails.tole || '',
        citizenshipNo: user.kycDetails.citizenshipNo || '',
        citizenshipIssueDate: user.kycDetails.citizenshipIssueDate || '',
        citizenshipIssueDistrict: user.kycDetails.citizenshipIssueDistrict || '',
        fatherName: user.kycDetails.fatherName || '',
        motherName: user.kycDetails.motherName || '',
        grandfatherName: user.kycDetails.grandfatherName || ''
      });
    }
    setEditing(true);
    setError("");
    setSuccess("");
  };

  /**
   * Cancels editing mode and resets form data to original user values.
   * Clears error and success messages.
   */
  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user.name,
      email: user.email,
      citizenshipNo: user.citizenshipNo
    });
    // Reset KYC form data to original values
    if (user?.kycDetails) {
      setKycFormData({
        fullName: user.kycDetails.fullName || "",
        fullNameNepali: user.kycDetails.fullNameNepali || "",
        dateOfBirth: user.kycDetails.dateOfBirth || "",
        gender: user.kycDetails.gender || "",
        nationality: user.kycDetails.nationality || "",
        province: user.kycDetails.province || "",
        district: user.kycDetails.district || "",
        municipality: user.kycDetails.municipality || "",
        wardNo: user.kycDetails.wardNo || "",
        tole: user.kycDetails.tole || "",
        citizenshipNo: user.kycDetails.citizenshipNo || "",
        citizenshipIssueDate: user.kycDetails.citizenshipIssueDate || "",
        citizenshipIssueDistrict: user.kycDetails.citizenshipIssueDistrict || "",
        fatherName: user.kycDetails.fatherName || "",
        motherName: user.kycDetails.motherName || "",
        grandfatherName: user.kycDetails.grandfatherName || ""
      });
    }
    setFrontImage(null);
    setBackImage(null);
    setError("");
    setSuccess("");
    setCitizenshipNoError("");
  };

  /**
   * Handles saving the updated profile information.
   * Sends update request to API and updates user state.
   */
  const handleSave = async () => {
    console.log('handleSave called');
    console.log('formData:', formData);
    console.log('kycFormData:', kycFormData);
    console.log('user?.kycStatus:', user?.kycStatus);
    
    const citizenshipNo = formData.citizenshipNo || "";
    // Allow various formats - at least 6 digits with or without dashes
    const digitsOnly = citizenshipNo.replace(/-/g, '');
    const citizenshipValid = digitsOnly.length >= 6 && digitsOnly.length <= 20 && /^\d+$/.test(digitsOnly);
    console.log('Citizenship number:', citizenshipNo);
    console.log('Digits only:', digitsOnly);
    console.log('Citizenship valid:', citizenshipValid);
    if (!citizenshipValid) {
      setCitizenshipNoError(getLabel(profileLabels.citizenshipNoError));
      return;
    }
    setCitizenshipNoError("");
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token present:', !!token);
      
      // First update profile
      console.log('Updating profile...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Profile update response status:', response.status);

      const data = await response.json();
      console.log('Profile update response data:', data);

      if (!response.ok) {
        setError(data.message || 'Failed to update profile');
        console.error('Profile update failed');
        return;
      }

      console.log('Profile updated successfully');

      // If user has existing KYC data, update it to reset status to pending
      if (user?.kycStatus && user?.kycStatus !== 'none') {
        console.log('Updating KYC with status:', user?.kycStatus);
        const kycUpdateFormData = new FormData();
        kycUpdateFormData.append('fullName', kycFormData.fullName || formData.name || '');
        kycUpdateFormData.append('fullNameNepali', kycFormData.fullNameNepali || '');
        kycUpdateFormData.append('dateOfBirth', kycFormData.dateOfBirth || '');
        kycUpdateFormData.append('gender', kycFormData.gender || '');
        kycUpdateFormData.append('nationality', kycFormData.nationality || '');
        kycUpdateFormData.append('province', kycFormData.province || '');
        kycUpdateFormData.append('district', kycFormData.district || '');
        kycUpdateFormData.append('municipality', kycFormData.municipality || '');
        kycUpdateFormData.append('wardNo', kycFormData.wardNo || '');
        kycUpdateFormData.append('tole', kycFormData.tole || '');
        kycUpdateFormData.append('citizenshipNo', formData.citizenshipNo || kycFormData.citizenshipNo || '');
        kycUpdateFormData.append('citizenshipIssueDate', kycFormData.citizenshipIssueDate || '');
        kycUpdateFormData.append('citizenshipIssueDistrict', kycFormData.citizenshipIssueDistrict || '');
        kycUpdateFormData.append('fatherName', kycFormData.fatherName || '');
        kycUpdateFormData.append('motherName', kycFormData.motherName || '');
        kycUpdateFormData.append('grandfatherName', kycFormData.grandfatherName || '');

        // Add files if selected
        if (frontImage) {
          kycUpdateFormData.append('frontImage', frontImage);
        }
        if (backImage) {
          kycUpdateFormData.append('backImage', backImage);
        }

        const kycResponse = await fetch(`${import.meta.env.VITE_API_URL}/kyc/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: kycUpdateFormData
        });
        
        console.log('KYC update response status:', kycResponse.status);
        const kycData = await kycResponse.json();
        console.log('KYC update response data:', kycData);
        
        setSuccess(getLabel(profileLabels.profileAndKycUpdated));
      } else {
        console.log('No KYC to update, status:', user?.kycStatus);
        setSuccess(getLabel(profileLabels.profileUpdated));
      }

      // Refresh user data
      await fetchProfile();
      setEditing(false);
      setError("");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-nepal-blue border-t-transparent"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Error</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Modal for Edit Profile
  if (showConfirmModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaEdit className="mr-2" />
              {getLabel(profileLabels.editProfile)}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-4">
                <FaClock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 text-center mb-6">
              {getLabel(profileLabels.kycWillBeReset)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                {getLabel(profileLabels.cancel)}
              </button>
              <button
                onClick={confirmEdit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {getLabel(profileLabels.editProfile)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-6 p-3 text-gray-500 hover:text-blue-700 hover:bg-white rounded-full transition-all duration-200 shadow-md hover:scale-110 active:scale-95"
              >
                <FaArrowLeft className="text-2xl" />
              </button>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight animate-slide-in-down">{getLabel(profileLabels.myProfile)}</h1>
                <p className="text-gray-500 text-lg font-medium animate-fade-in-slow">
                  {getLabel(profileLabels.manageAccount)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-7 py-3 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 animate-pop-in"
                >
                  <FaEdit className="mr-2" />
                  {getLabel(profileLabels.editProfile)}
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center px-7 py-3 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 animate-pop-in"
                  >
                    <FaSave className="mr-2" />
                    {getLabel(profileLabels.saveChanges)}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-7 py-3 border border-gray-300 text-base font-semibold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 animate-pop-in"
                  >
                    <FaTimes className="mr-2" />
                    {getLabel(profileLabels.cancel)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl shadow-md animate-fade-in-slow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaSave className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-md animate-fade-in-slow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTimes className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100 animate-fade-in-slow">
          {/* Profile Header with Picture */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 px-10 py-10 relative">
            <div className="flex items-center">
              <div className="flex-shrink-0 relative group">
                {user?.image ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/public/uploads/users/${user.image}`}
                    alt="Profile"
                    className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-white/30 flex items-center justify-center border-4 border-white shadow-xl">
                    <FaUser className="h-14 w-14 text-white" />
                  </div>
                )}
                <span className="absolute bottom-2 right-2 bg-white/80 text-blue-600 text-xs px-2 py-1 rounded-full shadow-md font-semibold animate-bounce">
                  {user?.role?.toUpperCase() || 'USER'}
                </span>
              </div>
              <div className="ml-8">
                <h2 className="text-3xl font-extrabold text-white mb-1 tracking-wide animate-slide-in-right">
                  {kycDetails?.fullName || 'User Name'}
                </h2>
                <p className="text-blue-100 text-lg font-medium">{user?.email}</p>
                <div className="flex items-center mt-4 space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-md transition-all duration-200 ${
                    user?.status === 'active' 
                      ? 'bg-green-100 text-green-800 animate-pulse' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <FaShieldAlt className="mr-1" />
                    {user?.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 shadow-md">
                    <FaUserTag className="mr-1" />
                    {user?.role?.toUpperCase() || 'USER'}
                  </span>
                  {user?.kycStatus && (
                    <div className="flex items-center">
                      
                     {getKycStatusBadge(user.kycStatus)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-10 py-10 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
            
            <div className="space-y-8">

              {/* Profile Picture Section - Show for both cases */}
              <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                <div className="flex items-center mb-3">
                  <FaCamera className="h-5 w-5 text-blue-500 mr-3" />
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                    {getLabel(profileLabels.profilePicture)}
                  </label>
                </div>
                <div className="flex items-center space-x-6">
                  {user?.image ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/public/uploads/users/${user.image}`}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-blue-200 shadow-md transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        console.error('Profile image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`h-20 w-20 rounded-full border-2 border-blue-200 bg-gray-100 flex items-center justify-center ${user?.image ? 'hidden' : ''}`}
                  >
                    <FaUser className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      {user?.image ? getLabel(profileLabels.uploadedDuringReg) : getLabel(profileLabels.noProfilePicture)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.image ? getLabel(profileLabels.imageUploadedWhen) : getLabel(profileLabels.profilePicturesDuringReg)}
                    </p>
                  </div>
                </div>

                {/* KYC Details Section - Complete Display with Localization */}
                {(user?.kycStatus || user?.kycDetails) && (
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                          <FaIdCardAlt className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{getLabel(profileLabels.identityVerification)}</h3>
                          <p className="text-sm text-slate-500">{getLabel(profileLabels.kycDocumentation)}</p>
                        </div>
                      </div>
                      {editing ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <FaClock className="mr-1" /> {getLabel(profileLabels.editing)}
                        </span>
                      ) : getKycStatusBadge(user?.kycStatus)}
                    </div>
                    
                    {/* Pending Status */}
                    {user?.kycStatus === 'pending' && !editing && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
                        <div className="flex items-center">
                          <FaClock className="h-5 w-5 text-amber-600 mr-3" />
                          <p className="text-amber-800 font-medium">{getLabel(profileLabels.kycPending)}</p>
                        </div>
                      </div>
                    )}

                    {/* Rejected Status */}
                    {user?.kycStatus === 'rejected' && user?.kycDetails?.rejectionReason && !editing && (
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-6">
                        <div className="flex items-start">
                          <FaTimesCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-800">{getLabel(profileLabels.kycRejected)}</p>
                            <p className="text-sm text-red-700 mt-1">{user.kycDetails.rejectionReason}</p>
                            <button 
                              onClick={() => navigate('/kyc-form')}
                              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                            >
                              {getLabel(profileLabels.resubmitDocuments)}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Mode Warning */}
                    {editing && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                        <div className="flex items-center">
                          <FaEdit className="h-5 w-5 text-blue-600 mr-3" />
                          <p className="text-blue-800 font-medium">{getLabel(profileLabels.kycEditingWarning)}</p>
                        </div>
                      </div>
                    )}

                    {/* Show All KYC Details - Display or Edit Mode */}
                    {((!editing && (user?.kycStatus === 'verified' || user?.kycStatus === 'pending' || user?.kycStatus === 'rejected') && user?.kycDetails) || editing) && (
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
                            <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                            {getLabel(profileLabels.personalInformation)}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Full Name - Editable */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                              <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.fullName)}</p>
                              {editing ? (
                                <input
                                  type="text"
                                  name="fullName"
                                  value={kycFormData.fullName || ''}
                                  onChange={handleKycChange}
                                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={getLabel(profileLabels.enterFullName)}
                                />
                              ) : (
                                <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.fullName}</p>
                              )}
                            </div>
                            {/* Full Name Nepali - Editable */}
                            {user.kycDetails.fullNameNepali && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.fullNameNepali)}</p>
                                {editing ? (
                                  <input
                                    type="text"
                                    name="fullNameNepali"
                                    value={kycFormData.fullNameNepali || ''}
                                    onChange={handleKycChange}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={getLabel(profileLabels.enterFullNameNepali)}
                                  />
                                ) : (
                                  <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.fullNameNepali}</p>
                                )}
                              </div>
                            )}
                            {/* Date of Birth - Editable */}
                            {user.kycDetails.dateOfBirth && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.dateOfBirth)}</p>
                                {editing ? (
                                  <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={kycFormData.dateOfBirth || ''}
                                    onChange={handleKycChange}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                ) : (
                                  <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.dateOfBirth}</p>
                                )}
                              </div>
                            )}
                            {/* Gender - Editable */}
                            {user.kycDetails.gender && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.gender)}</p>
                                {editing ? (
                                  <select
                                    name="gender"
                                    value={kycFormData.gender || ''}
                                    onChange={handleKycChange}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">{getLabel(profileLabels.selectGender)}</option>
                                    <option value="Male">{getLabel(profileLabels.male)}</option>
                                    <option value="Female">{getLabel(profileLabels.female)}</option>
                                    <option value="Other">{getLabel(profileLabels.other)}</option>
                                  </select>
                                ) : (
                                  <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.gender}</p>
                                )}
                              </div>
                            )}
                            {/* Nationality - Editable */}
                            {user.kycDetails.nationality && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.nationality)}</p>
                                {editing ? (
                                  <input
                                    type="text"
                                    name="nationality"
                                    value={kycFormData.nationality || ''}
                                    onChange={handleKycChange}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={getLabel(profileLabels.enterNationality)}
                                  />
                                ) : (
                                  <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.nationality}</p>
                                )}
                              </div>
                            )}
                            {user.email && (
                               <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.email)}</p>
                                {editing ? (
                                  <input
                                    type="email"
                                    name="email"
                                    value={user.email || ''}
                                    onChange={handleKycChange}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={getLabel(profileLabels.enterEmail)}
                                    disabled
                                  />
                                ) : (
                                  <p className="text-sm font-bold text-slate-800 mt-1">{user.email}</p>
                                )}
                              </div>
                            )
                              }
                          </div>
                        </div>

                        {/* Address Information */}
                        {(editing || user.kycDetails.province || user.kycDetails.district || user.kycDetails.municipality || user.kycDetails.wardNo || user.kycDetails.tole) && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
                              <span className="w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                              {getLabel(profileLabels.addressInformation)}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {editing ? (
                                <>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.province)}</p>
                                    <select
                                      name="province"
                                      value={kycFormData.province || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                      <option value="">{getLabel(profileLabels.selectProvince)}</option>
                                      <option value="Province 1">{getLabel(profileLabels.province1)}</option>
                                      <option value="Province 2">{getLabel(profileLabels.province2)}</option>
                                      <option value="Province 3">{getLabel(profileLabels.province3)}</option>
                                      <option value="Province 4">{getLabel(profileLabels.province4)}</option>
                                      <option value="Province 5">{getLabel(profileLabels.province5)}</option>
                                      <option value="Province 6">{getLabel(profileLabels.province6)}</option>
                                      <option value="Province 7">{getLabel(profileLabels.province7)}</option>
                                    </select>
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.district)}</p>
                                    <input
                                      type="text"
                                      name="district"
                                      value={kycFormData.district || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder={getLabel(profileLabels.enterDistrict)}
                                    />
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.municipality)}</p>
                                    <input
                                      type="text"
                                      name="municipality"
                                      value={kycFormData.municipality || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder={getLabel(profileLabels.enterMunicipality)}
                                    />
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.wardNo)}</p>
                                    <input
                                      type="text"
                                      name="wardNo"
                                      value={kycFormData.wardNo || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder={getLabel(profileLabels.enterWardNo)}
                                    />
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.tole)}</p>
                                    <input
                                      type="text"
                                      name="tole"
                                      value={kycFormData.tole || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder={getLabel(profileLabels.enterTole)}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  {user.kycDetails.province && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.province)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.province}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.district && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.district)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.district}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.municipality && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.municipality)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.municipality}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.wardNo && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.wardNo)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.wardNo}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.tole && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.tole)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.tole}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Citizenship Information */}
                        {(editing || user.kycDetails.citizenshipNo || user.kycDetails.citizenshipIssueDate || user.kycDetails.citizenshipIssueDistrict) && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
                              <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
                              {getLabel(profileLabels.citizenshipDetails)}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {editing ? (
                                <>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.citizenshipNumber)}</p>
                                    <input
                                      type="text"
                                      name="citizenshipNo"
                                      value={kycDetails.citizenshipNo || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      placeholder={getLabel(profileLabels.enterCitizenshipNumber)}
                                      disabled
                                    />
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.issueDate)}</p>
                                    <input
                                      type="date"
                                      name="citizenshipIssueDate"
                                      value={kycFormData.citizenshipIssueDate || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.issueDistrict)}</p>
                                    <input
                                      type="text"
                                      name="citizenshipIssueDistrict"
                                      value={kycFormData.citizenshipIssueDistrict || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      placeholder={getLabel(profileLabels.enterIssueDistrict)}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  {user.kycDetails.citizenshipNo && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.citizenshipNumber)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.citizenshipNo}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.citizenshipIssueDate && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.issueDate)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.citizenshipIssueDate}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.citizenshipIssueDistrict && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.issueDistrict)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.citizenshipIssueDistrict}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Family Information */}
                        {(editing || user.kycDetails.fatherName || user.kycDetails.motherName || user.kycDetails.grandfatherName) && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
                              <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                              {getLabel(profileLabels.familyInformation)}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {editing ? (
                                <>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.fatherName)}</p>
                                    <input
                                      type="text"
                                      name="fatherName"
                                      value={kycFormData.fatherName || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder={getLabel(profileLabels.enterFatherName)}
                                    />
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.motherName)}</p>
                                    <input
                                      type="text"
                                      name="motherName"
                                      value={kycFormData.motherName || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder={getLabel(profileLabels.enterMotherName)}
                                    />
                                  </div>
                                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.grandfatherName)}</p>
                                    <input
                                      type="text"
                                      name="grandfatherName"
                                      value={kycFormData.grandfatherName || ''}
                                      onChange={handleKycChange}
                                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder={getLabel(profileLabels.enterGrandfatherName)}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  {user.kycDetails.fatherName && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.fatherName)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.fatherName}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.motherName && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.motherName)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.motherName}</p>
                                    </div>
                                  )}
                                  {user.kycDetails.grandfatherName && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                      <p className="text-xs font-semibold text-slate-400 uppercase">{getLabel(profileLabels.grandfatherName)}</p>
                                      <p className="text-sm font-bold text-slate-800 mt-1">{user.kycDetails.grandfatherName}</p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Citizenship Documents */}
                        {(editing || user.kycDetails.frontImage || user.kycDetails.backImage) && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center">
                              <span className="w-1 h-4 bg-orange-500 rounded-full mr-2"></span>
                              {getLabel(profileLabels.citizenshipDocuments)}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Front Image */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-md">
                                <p className="text-xs font-semibold text-slate-500 mb-3">{getLabel(profileLabels.frontSide)}</p>
                                {editing ? (
                                  <div className="space-y-3">
                                    {/* Show existing image preview */}
                                    {user.kycDetails.frontImage && !frontImage && (
                                      <div className="relative">
                                        <img 
                                          src={`${import.meta.env.VITE_API_URL}/public${user.kycDetails.frontImage}`}
                                          alt="Citizenship Front"
                                          className="w-full h-48 object-contain rounded-lg border border-slate-300 bg-slate-50 p-2"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">{getLabel(profileLabels.currentFile)}</p>
                                      </div>
                                    )}
                                    {/* Show newly selected image */}
                                    {frontImage && (
                                      <div className="relative">
                                        <img 
                                          src={URL.createObjectURL(frontImage)}
                                          alt="New Citizenship Front"
                                          className="w-full h-48 object-contain rounded-lg border border-green-300 bg-green-50 p-2"
                                        />
                                        <p className="text-xs text-green-600 mt-1">✓ New file selected</p>
                                      </div>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileChange(e, 'frontImage')}
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {frontImage && (
                                      <button
                                        type="button"
                                        onClick={() => setFrontImage(null)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                      >
                                        ✕ Remove new file
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="relative">
                                    {user.kycDetails.frontImage && (
                                      <img 
                                        src={`${import.meta.env.VITE_API_URL}/public${user.kycDetails.frontImage}`}
                                        alt="Citizenship Front"
                                        className="w-full h-64 object-contain rounded-lg border border-slate-300 bg-slate-50 p-2"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          if (e.target.nextSibling) {
                                            e.target.nextSibling.style.display = 'flex';
                                          }
                                        }}
                                      />
                                    )}
                                    <div className="hidden w-full h-64 items-center justify-center rounded-lg border border-slate-300 bg-slate-100">
                                      <div className="text-center">
                                        <FaIdCardAlt className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">{getLabel(profileLabels.imageNotAvailable)}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* Back Image */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-md">
                                <p className="text-xs font-semibold text-slate-500 mb-3">{getLabel(profileLabels.backSide)}</p>
                                {editing ? (
                                  <div className="space-y-3">
                                    {/* Show existing image preview */}
                                    {user.kycDetails.backImage && !backImage && (
                                      <div className="relative">
                                        <img 
                                          src={`${import.meta.env.VITE_API_URL}/public${user.kycDetails.backImage}`}
                                          alt="Citizenship Back"
                                          className="w-full h-48 object-contain rounded-lg border border-slate-300 bg-slate-50 p-2"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">{getLabel(profileLabels.currentFile)}</p>
                                      </div>
                                    )}
                                    {/* Show newly selected image */}
                                    {backImage && (
                                      <div className="relative">
                                        <img 
                                          src={URL.createObjectURL(backImage)}
                                          alt="New Citizenship Back"
                                          className="w-full h-48 object-contain rounded-lg border border-green-300 bg-green-50 p-2"
                                        />
                                        <p className="text-xs text-green-600 mt-1">✓ New file selected</p>
                                      </div>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileChange(e, 'backImage')}
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {backImage && (
                                      <button
                                        type="button"
                                        onClick={() => setBackImage(null)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                      >
                                        ✕ Remove new file
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="relative">
                                    {user.kycDetails.backImage && (
                                      <img 
                                        src={`${import.meta.env.VITE_API_URL}/public${user.kycDetails.backImage}`}
                                        alt="Citizenship Back"
                                        className="w-full h-64 object-contain rounded-lg border border-slate-300 bg-slate-50 p-2"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          if (e.target.nextSibling) {
                                            e.target.nextSibling.style.display = 'flex';
                                          }
                                        }}
                                      />
                                    )}
                                    <div className="hidden w-full h-64 items-center justify-center rounded-lg border border-slate-300 bg-slate-100">
                                      <div className="text-center">
                                        <FaIdCardAlt className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">{getLabel(profileLabels.imageNotAvailable)}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Submission Date */}
                        {user.kycDetails.submittedAt && (
                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500">
                              {getLabel(profileLabels.submittedOn)}: {new Date(user.kycDetails.submittedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        
                      </div>
                    )}
                    
                    {/* Not Submitted */}
                    {user?.kycStatus === 'none' && (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaIdCardAlt className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium mb-2">{getLabel(profileLabels.kycNotSubmitted)}</p>
                        <p className="text-sm text-slate-500 mb-4">{getLabel(profileLabels.completeKyc)}</p>
                        <button 
                          onClick={() => navigate('/kyc-form')}
                          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                        >
                          {getLabel(profileLabels.submitKyc)}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {user?.image ? (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-md hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                  <div className="flex items-center mb-4">
                    <FaCamera className="h-6 w-6 text-blue-500 mr-3" />
                    <label className="text-lg font-bold text-gray-800">
                      {getLabel(profileLabels.passportPhoto)}
                    </label>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
                    {/* Photo Display */}
                    <div className="flex-shrink-0">
                      <div className="relative group">
                        <img 
                          src={`${import.meta.env.VITE_API_URL}/public/uploads/users/${user.image}`}
                          alt="Passport Size Photo"
                          className="h-36 w-28 rounded-xl object-cover border-4 border-white shadow-xl transition-transform duration-300 group-hover:scale-105"
                          style={{ aspectRatio: '3/4' }}
                          onError={(e) => {
                            console.error('Image failed to load:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="h-36 w-28 rounded-xl border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
                          style={{ display: 'none', aspectRatio: '3/4' }}
                        >
                          {getLabel(profileLabels.imageFailed)}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md font-bold animate-bounce">
                          ✓ {getLabel(profileLabels.verified)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo Information */}
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{getLabel(profileLabels.photoDetails)}</h4>
                          <p className="text-sm text-gray-600">
                            {getLabel(profileLabels.photoDescription)}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{getLabel(profileLabels.format)}</p>
                            <p className="text-sm font-semibold text-gray-900">{getLabel(profileLabels.passportSize)}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{getLabel(profileLabels.uploadDate)}</p>
                            <p className="text-sm font-semibold text-gray-900">{getLabel(profileLabels.registration)}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{getLabel(profileLabels.status)}</p>
                            <p className="text-sm font-semibold text-green-600">✓ {getLabel(profileLabels.approved)}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">{getLabel(profileLabels.usage)}</p>
                            <p className="text-sm font-semibold text-gray-900">{getLabel(profileLabels.accountProfile)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 shadow-sm">
                          <p className="text-xs font-medium text-blue-800 mb-1">{getLabel(profileLabels.photoRequirements)}</p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• {getLabel(profileLabels.passportDimensions)}</li>
                            <li>• {getLabel(profileLabels.clearImage)}</li>
                            <li>• {getLabel(profileLabels.properLighting)}</li>
                            <li>• {getLabel(profileLabels.fileSize)}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 rounded-2xl p-6 border border-blue-100 shadow-md hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                  <div className="flex items-center mb-4">
                    <FaCamera className="h-6 w-6 text-gray-400 mr-3" />
                    <label className="text-lg font-bold text-gray-600">
                      {getLabel(profileLabels.noPhotoUploaded)}
                    </label>
                  </div>
                  <div className="text-center py-8">
                    <div className="h-36 w-28 mx-auto rounded-xl border-4 border-gray-300 bg-gray-100 flex items-center justify-center">
                      <FaUser className="h-14 w-14 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mt-4">{getLabel(profileLabels.noPhotoDescription)}</p>
                    <p className="text-sm text-gray-500">{getLabel(profileLabels.photosUploadedDuring)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Animations */}
      <style>
        {`
          .animate-fade-in { animation: fadeIn 0.7s ease; }
          .animate-fade-in-slow { animation: fadeIn 1.2s ease; }
          .animate-slide-in-down { animation: slideInDown 0.7s cubic-bezier(.4,0,.2,1); }
          .animate-slide-in-up { animation: slideInUp 0.7s cubic-bezier(.4,0,.2,1); }
          .animate-slide-in-right { animation: slideInRight 0.7s cubic-bezier(.4,0,.2,1); }
          .animate-pop-in { animation: popIn 0.5s cubic-bezier(.4,0,.2,1); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1, transform: translateY(0);} }
          @keyframes slideInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1, transform: translateY(0);} }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(30px);} to { opacity: 1, transform: translateX(0);} }
          @keyframes popIn { 0% { opacity: 0; transform: scale(0.8);} 80% { opacity: 1; transform: scale(1.05);} 100% { opacity: 1; transform: scale(1);} }
        `}
      </style>
    </div>
  );
}

export default Profile;
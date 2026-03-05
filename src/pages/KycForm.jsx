import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaUser, FaCalendar, FaMapMarkerAlt, FaIdCard, FaChild, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const KycForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameNepali: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Nepalese',
    province: '',
    district: '',
    municipality: '',
    wardNo: '',
    tole: '',
    citizenshipNo: '',
    citizenshipIssueDate: '',
    citizenshipIssueDistrict: '',
    fatherName: '',
    motherName: '',
    grandfatherName: '',
    rejectionReason: ''
  });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [backImagePreview, setBackImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch user profile
        const userRes = await axios.get('/auth/profile', {
          baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9005',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userRes.data.result) {
          const userData = userRes.data.result;
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            fullName: userData.name || '',
            citizenshipNo: userData.citizenshipNo || '',
            // Include rejection reason if KYC was rejected
            rejectionReason: userData.kycDetails?.rejectionReason || ''
          }));
          setKycStatus(userData.kycStatus);
          
          // Also load image URLs directly from user profile
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:9005';
          if (userData.kycDetails) {
            if (userData.kycDetails.frontImage) {
              const frontUrl = userData.kycDetails.frontImage.startsWith('http') 
                ? userData.kycDetails.frontImage 
                : `${backendUrl}/public/${userData.kycDetails.frontImage}`;
              setFrontImagePreview(frontUrl);
            }
            if (userData.kycDetails.backImage) {
              const backUrl = userData.kycDetails.backImage.startsWith('http') 
                ? userData.kycDetails.backImage 
                : `${backendUrl}/public/${userData.kycDetails.backImage}`;
              setBackImagePreview(backUrl);
            }
          }
        }

        // Fetch KYC details if exists (for pending, verified, or rejected status)
        if (userRes.data.result?.kycStatus && userRes.data.result.kycStatus !== 'none') {
          try {
            const kycRes = await axios.get('/kyc/my-kyc', {
              baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9005',
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (kycRes.data.kycDetails) {
              setFormData(prev => ({
                ...prev,
                ...kycRes.data.kycDetails
              }));
              
              const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:9005';
              if (kycRes.data.kycDetails.frontImage) {
                const frontUrl = kycRes.data.kycDetails.frontImage.startsWith('http') 
                  ? kycRes.data.kycDetails.frontImage 
                  : `${backendUrl}${kycRes.data.kycDetails.frontImage}`;
                setFrontImagePreview(frontUrl);
              }
              if (kycRes.data.kycDetails.backImage) {
                const backUrl = kycRes.data.kycDetails.backImage.startsWith('http') 
                  ? kycRes.data.kycDetails.backImage 
                  : `${backendUrl}${kycRes.data.kycDetails.backImage}`;
                setBackImagePreview(backUrl);
              }
            }
          } catch (kycError) {
            console.log('No existing KYC details found');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === 'frontImage') {
        setFrontImage(file);
        setFrontImagePreview(URL.createObjectURL(file));
      } else {
        setBackImage(file);
        setBackImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Allow submission if either:
    // 1. Both front and back images are provided as new files, OR
    // 2. Both front and back image previews exist (from previous submission)
    const hasNewImages = frontImage && backImage;
    const hasExistingImages = frontImagePreview && backImagePreview;
    
    if (!hasNewImages && !hasExistingImages) {
      toast.error('Please upload both front and back citizenship images');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      // Only append new images if they were selected
      if (frontImage) {
        data.append('frontImage', frontImage);
      }
      if (backImage) {
        data.append('backImage', backImage);
      }

      // Determine endpoint based on existing KYC status
      // Use the original kycStatus from user data, not the current form display state
      const originalKycStatus = user?.kycStatus;
      const isResubmission = originalKycStatus && originalKycStatus !== 'none';
      console.log('Submitting KYC - Original Status:', originalKycStatus, 'Is Resubmission:', isResubmission);
      
      const method = isResubmission ? 'put' : 'post';
      const endpoint = isResubmission ? '/kyc/update' : '/kyc/submit';

      const response = await axios[method](endpoint, data, {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9005',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast.success('KYC submitted successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  const getKycStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-2" size={24} />
            <span className="text-lg font-semibold">KYC Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <FaClock className="mr-2" size={24} />
            <span className="text-lg font-semibold">KYC Pending Review</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <FaTimesCircle className="mr-2" size={24} />
            <span className="text-lg font-semibold">KYC Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-nepal-blue"></div>
      </div>
    );
  }

  // Show status view if KYC is submitted
  if (kycStatus && kycStatus !== 'none' && kycStatus !== 'rejected') {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">KYC Status</h1>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Back to Profile
              </button>
            </div>
            
            <div className="flex justify-center py-8">
              {getKycStatusBadge(kycStatus)}
            </div>

            {kycStatus === 'verified' && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Your KYC has been verified!</h3>
                <p className="text-green-700">You can now access all features of the Bluebook Renewal System.</p>
              </div>
            )}

            {kycStatus === 'pending' && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Your KYC is under review</h3>
                <p className="text-yellow-700">Please wait while our team verifies your documents. This usually takes 1-2 business days.</p>
              </div>
            )}

            {kycStatus === 'rejected' && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">KYC Rejected</h3>
                <p className="text-red-700">Reason: {formData.rejectionReason || 'KYC verification failed. Please resubmit with correct documents.'}</p>
                <button
                  onClick={() => setKycStatus('none')}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Resubmit KYC
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">KYC Verification Form</h1>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaUser className="mr-2" /> Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (English) *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">पूरा नाम (नेपाली)</label>
                  <input
                    type="text"
                    name="fullNameNepali"
                    value={formData.fullNameNepali}
                    onChange={handleInputChange}
                    pattern="^[\u0900-\u097F\s]+$"
                    placeholder="नेपालीमा लेख्नुहोस्"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Address Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  >
                    <option value="">Select Province</option>
                    <option value="Province 1">Province 1</option>
                    <option value="Province 2">Province 2</option>
                    <option value="Province 3">Province 3 (Bagmati)</option>
                    <option value="Province 4">Province 4 (Gandaki)</option>
                    <option value="Province 5">Province 5 (Lumbini)</option>
                    <option value="Province 6">Province 6 (Karnali)</option>
                    <option value="Province 7">Province 7 (Sudurpashchim)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipality/Rural Municipality *</label>
                  <input
                    type="text"
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward No. *</label>
                  <input
                    type="text"
                    name="wardNo"
                    value={formData.wardNo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tole/Street</label>
                  <input
                    type="text"
                    name="tole"
                    value={formData.tole}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
              </div>
            </div>

            {/* Citizenship Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaIdCard className="mr-2" /> Citizenship Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship Number *</label>
                  <input
                    type="text"
                    name="citizenshipNo"
                    value={formData.citizenshipNo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    name="citizenshipIssueDate"
                    value={formData.citizenshipIssueDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue District *</label>
                  <input
                    type="text"
                    name="citizenshipIssueDistrict"
                    value={formData.citizenshipIssueDistrict}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaChild className="mr-2" /> Family Information
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grandfather's Name</label>
                  <input
                    type="text"
                    name="grandfatherName"
                    value={formData.grandfatherName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-blue"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaUpload className="mr-2" /> Document Upload
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship Front Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {frontImagePreview ? (
                      <div className="relative">
                        <img
                          src={frontImagePreview}
                          alt="Front"
                          className="max-h-48 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFrontImage(null);
                            setFrontImagePreview(null);
                          }}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                        <span className="text-gray-600">Click to upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'frontImage')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship Back Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {backImagePreview ? (
                      <div className="relative">
                        <img
                          src={backImagePreview}
                          alt="Back"
                          className="max-h-48 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBackImage(null);
                            setBackImagePreview(null);
                          }}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                        <span className="text-gray-600">Click to upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'backImage')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 bg-nepal-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit KYC'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KycForm;

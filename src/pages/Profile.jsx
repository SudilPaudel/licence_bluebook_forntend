import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaIdCard, FaEdit, FaSave, FaTimes, FaCamera, FaArrowLeft, FaShieldAlt, FaUserTag } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import { profileLabels } from "../labels/profileLabels";

function Profile() {
  // Main component for displaying and editing user profile

  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    citizenshipNo: ""
  });

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
        setFormData({
          name: data.result.name,
          email: data.result.email,
          citizenshipNo: data.result.citizenshipNo
        });
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Enables editing mode for the profile.
   * Clears error and success messages.
   */
  const handleEdit = () => {
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
    setError("");
    setSuccess("");
  };

  /**
   * Handles saving the updated profile information.
   * Sends update request to API and updates user state.
   */
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.result);
        setEditing(false);
        setSuccess('Profile updated successfully!');
        setError("");
      } else {
        setError(data.message || 'Failed to update profile');
      }
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
                  {user?.name || 'User Name'}
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
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-10 py-10 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
            <h3 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight animate-slide-in-up">{getLabel(profileLabels.personalInformation)}</h3>
            
            <div className="space-y-8">
              {/* Full Name */}
              <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                <div className="flex items-center mb-3">
                  <FaUser className="h-5 w-5 text-blue-500 mr-3" />
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                    {getLabel(profileLabels.fullName)}
                  </label>
                </div>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 bg-white/90 font-semibold transition-all duration-200"
                    placeholder={getLabel(profileLabels.enterFullName)}
                  />
                ) : (
                  <p className="text-lg text-gray-900 font-semibold">{user?.name || 'N/A'}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                <div className="flex items-center mb-3">
                  <FaEnvelope className="h-5 w-5 text-blue-500 mr-3" />
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                    {getLabel(profileLabels.emailAddress)}
                  </label>
                </div>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 bg-white/90 font-semibold transition-all duration-200"
                    placeholder={getLabel(profileLabels.enterEmail)}
                  />
                ) : (
                  <p className="text-lg text-gray-900 font-semibold">{user?.email || 'N/A'}</p>
                )}
              </div>

              {/* Citizenship Number */}
              <div className="bg-white/80 rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-300 animate-fade-in">
                <div className="flex items-center mb-3">
                  <FaIdCard className="h-5 w-5 text-blue-500 mr-3" />
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                    {getLabel(profileLabels.citizenshipNo)}
                  </label>
                </div>
                {editing ? (
                  <input
                    type="text"
                    name="citizenshipNo"
                    value={formData.citizenshipNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 bg-white/90 font-semibold transition-all duration-200"
                    placeholder={getLabel(profileLabels.enterCitizenshipNo)}
                  />
                ) : (
                  <p className="text-lg text-gray-900 font-semibold">{user?.citizenshipNo || 'N/A'}</p>
                )}
              </div>

              {/* Passport Size Photo Section */}
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
              </div>
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
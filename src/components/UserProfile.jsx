import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaMapMarkerAlt, FaPhone, FaPassport } from 'react-icons/fa';
import API from '../api/api';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/auth/profile',{
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9005',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        console.log('User profile response:', response.data);
        if (response.status === 200 && response.data.result) {
            const userData = response.data.result;
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-gray-200 animate-pulse">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-300"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
 console.log('User profile data:', user);
 
  const defaultImage = <FaUserCircle size={100} className="text-gray-400" />;
  if (!user) {
    return null;
    }
return (
    <div className="bg-white/90 shadow-xl rounded-2xl p-6 mb-10 hover:scale-105 transition-transform duration-200 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center md:space-x-6">
        <div className="flex-shrink-0 mb-4 md:mb-0">
          {user.image ? (
            <img
              src={user.image}
              alt="User"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-300 shadow-md"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
              {defaultImage}
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-md text-gray-500">{user.email}</p>
          <div className="mt-3 flex items-center justify-center md:justify-start text-gray-600 space-x-4">
            {user.address && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                <span>{user.address}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center">
                <FaPhone className="mr-2 text-blue-500" />
                <span>{user.phone}</span>
              </div>
            )}
             {user.citizenshipNo && (
              <div className="flex items-center">
                <FaPassport className="mr-2 text-blue-500" />
                <span>{user.citizenshipNo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
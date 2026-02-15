import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaShieldAlt, FaCar, FaFileAlt, FaUsers, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";
import { useLang } from "../context/LanguageContext";
import { footerLabels } from "../labels/footerLabels";

function Footer() {
  const navigate = useNavigate();
  const { getLabel } = useLang();

  const handleProtectedLink = (path) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.info(getLabel(footerLabels.pleaseLoginToAccess));
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const handleLink = (path) => {
    navigate(path);
  };

  return (
    <footer className="bg-gradient-to-br from-nepal-blue via-blue-800 to-nepal-blue text-white shadow-2xl rounded-t-3xl animate-fade-in-up">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Department Information */}
          <div className="lg:col-span-2">
            <div className="flex items-start mb-8 animate-slide-in-left">
              <FaShieldAlt className="h-12 w-12 text-yellow-400 mr-5 mt-1 flex-shrink-0 drop-shadow-lg animate-bounce-slow" />
              <div className="flex-1">
                <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight drop-shadow">
                  {getLabel(footerLabels.departmentName)}
                </h3>
                <p className="text-blue-100 text-lg font-semibold mb-3">{getLabel(footerLabels.governmentOfNepal)}</p>
                <p className="text-blue-100 leading-relaxed text-base opacity-90">
                  {getLabel(footerLabels.departmentDescription)}
                </p>
              </div>
            </div>
            <div className="flex space-x-4 mt-3">
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors duration-300 transform hover:scale-125">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors duration-300 transform hover:scale-125">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors duration-300 transform hover:scale-125">
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors duration-300 transform hover:scale-125">
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-5 flex items-center gap-2 animate-fade-in-down">
              <FaFileAlt className="mr-2 text-yellow-400" />
              {getLabel(footerLabels.quickLinks)}
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleLink('/')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-3 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/60 shadow hover:shadow-lg duration-300"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.home)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedLink('/dashboard')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-3 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/60 shadow hover:shadow-lg duration-300"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.dashboard)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedLink('/bluebook/new')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-3 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/60 shadow hover:shadow-lg duration-300"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.newBluebook)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedLink('/profile')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-3 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/60 shadow hover:shadow-lg duration-300"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.myProfile)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('/login')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-3 py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/60 shadow hover:shadow-lg duration-300"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.login)}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xl font-bold mb-5 flex items-center gap-2 animate-fade-in-down">
              <FaPhone className="mr-2 text-yellow-400" />
              {getLabel(footerLabels.contactUs)}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <FaMapMarkerAlt className="h-5 w-5 text-yellow-400 mt-1 mr-3 flex-shrink-0 animate-pulse" />
                <div className="text-left">
                  <p className="text-blue-100 text-sm font-medium">
                    {getLabel(footerLabels.transportManagementOffice)}<br />
                    {getLabel(footerLabels.address)}<br />
                    {getLabel(footerLabels.nepal)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 animate-pulse" />
                <a href="tel:+977-1-4221234" className="text-blue-200 hover:text-yellow-400 transition-colors text-sm font-medium underline underline-offset-2">
                  +977-1-4221234
                </a>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 animate-pulse" />
                <a href="mailto:info@dotm.gov.np" className="text-blue-200 hover:text-yellow-400 transition-colors text-sm font-medium underline underline-offset-2">
                  info@dotm.gov.np
                </a>
              </div>
              <div className="flex items-center">
                <FaGlobe className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 animate-pulse" />
                <a href="https://dotm.gov.np" className="text-blue-200 hover:text-yellow-400 transition-colors text-sm font-medium underline underline-offset-2">
                  www.dotm.gov.np
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mt-16 pt-10 border-t border-blue-700 animate-fade-in-up">
          <h4 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2 tracking-wide">
            <FaCar className="mr-2 text-yellow-400 animate-bounce-slow" />
            {getLabel(footerLabels.ourServices)}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center p-5 bg-blue-900/40 rounded-xl hover:bg-blue-900/70 transition-all duration-300 shadow-lg hover:scale-105 animate-zoom-in">
              <FaCar className="h-7 w-7 text-yellow-400 mx-auto mb-2 animate-bounce-slow" />
              <p className="text-base font-semibold">{getLabel(footerLabels.vehicleRegistration)}</p>
            </div>
            <div className="text-center p-5 bg-blue-900/40 rounded-xl hover:bg-blue-900/70 transition-all duration-300 shadow-lg hover:scale-105 animate-zoom-in">
              <FaFileAlt className="h-7 w-7 text-yellow-400 mx-auto mb-2 animate-bounce-slow" />
              <p className="text-base font-semibold">{getLabel(footerLabels.licenseRenewal)}</p>
            </div>
            <div className="text-center p-5 bg-blue-900/40 rounded-xl hover:bg-blue-900/70 transition-all duration-300 shadow-lg hover:scale-105 animate-zoom-in">
              <FaUsers className="h-7 w-7 text-yellow-400 mx-auto mb-2 animate-bounce-slow" />
              <p className="text-base font-semibold">{getLabel(footerLabels.driverTraining)}</p>
            </div>
            <div className="text-center p-5 bg-blue-900/40 rounded-xl hover:bg-blue-900/70 transition-all duration-300 shadow-lg hover:scale-105 animate-zoom-in">
              <FaShieldAlt className="h-7 w-7 text-yellow-400 mx-auto mb-2 animate-bounce-slow" />
              <p className="text-base font-semibold">{getLabel(footerLabels.safetyStandards)}</p>
            </div>
            <div className="text-center p-5 bg-blue-900/40 rounded-xl hover:bg-blue-900/70 transition-all duration-300 shadow-lg hover:scale-105 animate-zoom-in">
              <FaClock className="h-7 w-7 text-yellow-400 mx-auto mb-2 animate-bounce-slow" />
              <p className="text-base font-semibold">{getLabel(footerLabels.support247)}</p>
            </div>
            <div className="text-center p-5 bg-blue-900/40 rounded-xl hover:bg-blue-900/70 transition-all duration-300 shadow-lg hover:scale-105 animate-zoom-in">
              <FaGlobe className="h-7 w-7 text-yellow-400 mx-auto mb-2 animate-bounce-slow" />
              <p className="text-base font-semibold">{getLabel(footerLabels.onlineServices)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-blue-950/70 border-t border-blue-700 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="text-blue-200 text-sm tracking-wide">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-yellow-400">{getLabel(footerLabels.departmentName)}</span>, {getLabel(footerLabels.governmentOfNepal)}. {getLabel(footerLabels.allRightsReserved)}
            </div>
            <div className="flex space-x-8 text-sm">
              <a href="/privacy" className="text-blue-200 hover:text-yellow-400 transition-colors underline underline-offset-2">
                {getLabel(footerLabels.privacyPolicy)}
              </a>
              <a href="/terms" className="text-blue-200 hover:text-yellow-400 transition-colors underline underline-offset-2">
                {getLabel(footerLabels.termsOfService)}
              </a>
              <a href="/accessibility" className="text-blue-200 hover:text-yellow-400 transition-colors underline underline-offset-2">
                {getLabel(footerLabels.accessibility)}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Animations (add to your global CSS or Tailwind config if not present) */}
      <style>
        {`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in-up {
            animation: fade-in-up 1s cubic-bezier(0.4,0,0.2,1) both;
          }
          @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-30px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in-down {
            animation: fade-in-down 1s cubic-bezier(0.4,0,0.2,1) both;
          }
          @keyframes slide-in-left {
            0% { opacity: 0; transform: translateX(-40px);}
            100% { opacity: 1; transform: translateX(0);}
          }
          .animate-slide-in-left {
            animation: slide-in-left 1s cubic-bezier(0.4,0,0.2,1) both;
          }
          @keyframes zoom-in {
            0% { opacity: 0; transform: scale(0.8);}
            100% { opacity: 1; transform: scale(1);}
          }
          .animate-zoom-in {
            animation: zoom-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-8px);}
          }
          .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
          }
        `}
      </style>
    </footer>
  );
}

export default Footer;

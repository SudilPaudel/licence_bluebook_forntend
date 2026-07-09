import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaShieldAlt, FaCar, FaFileAlt, FaUsers, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";
import { useLang } from "../context/LanguageContext";
import { footerLabels } from "../labels/footerLabels";
import { getDefaultDashboardPath } from "../utils/auth";

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
    <footer className="bg-gradient-to-br from-nepal-blue via-blue-800 to-nepal-blue text-white shadow-xl rounded-t-2xl">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Department Information */}
          <div className="lg:col-span-2">
            <div className="flex items-start mb-4">
              <FaShieldAlt className="h-8 w-8 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                  {getLabel(footerLabels.departmentName)}
                </h3>
                <p className="text-blue-100 text-sm font-semibold mb-2">{getLabel(footerLabels.governmentOfNepal)}</p>
                <p className="text-blue-100 leading-relaxed text-sm opacity-90">
                  {getLabel(footerLabels.departmentDescription)}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold mb-3 flex items-center gap-2">
              <FaFileAlt className="text-yellow-400" />
              {getLabel(footerLabels.quickLinks)}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button 
                  onClick={() => handleLink('/')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-2.5 py-1.5 rounded-md bg-blue-900/30 hover:bg-blue-900/60 text-sm"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.home)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedLink(getDefaultDashboardPath())}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-2.5 py-1.5 rounded-md bg-blue-900/30 hover:bg-blue-900/60 text-sm"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.dashboard)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedLink('/bluebook/new')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-2.5 py-1.5 rounded-md bg-blue-900/30 hover:bg-blue-900/60 text-sm"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.newBluebook)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleProtectedLink('/profile')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-2.5 py-1.5 rounded-md bg-blue-900/30 hover:bg-blue-900/60 text-sm"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.myProfile)}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLink('/login')}
                  className="group text-blue-200 hover:text-yellow-400 transition-colors flex items-center w-full text-left px-2.5 py-1.5 rounded-md bg-blue-900/30 hover:bg-blue-900/60 text-sm"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  {getLabel(footerLabels.login)}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-base font-bold mb-3 flex items-center gap-2">
              <FaPhone className="text-yellow-400" />
              {getLabel(footerLabels.contactUs)}
            </h4>
            <div className="space-y-2.5">
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
        <div className="mt-8 pt-6 border-t border-blue-700">
          <h4 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">
            <FaCar className="text-yellow-400" />
            {getLabel(footerLabels.ourServices)}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="text-center p-3 bg-blue-900/40 rounded-lg hover:bg-blue-900/70 transition-all">
              <FaCar className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs font-semibold">{getLabel(footerLabels.vehicleRegistration)}</p>
            </div>
            <div className="text-center p-3 bg-blue-900/40 rounded-lg hover:bg-blue-900/70 transition-all">
              <FaFileAlt className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs font-semibold">{getLabel(footerLabels.licenseRenewal)}</p>
            </div>
            <div className="text-center p-3 bg-blue-900/40 rounded-lg hover:bg-blue-900/70 transition-all">
              <FaUsers className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs font-semibold">{getLabel(footerLabels.driverTraining)}</p>
            </div>
            <div className="text-center p-3 bg-blue-900/40 rounded-lg hover:bg-blue-900/70 transition-all">
              <FaShieldAlt className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs font-semibold">{getLabel(footerLabels.safetyStandards)}</p>
            </div>
            <div className="text-center p-3 bg-blue-900/40 rounded-lg hover:bg-blue-900/70 transition-all">
              <FaClock className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs font-semibold">{getLabel(footerLabels.support247)}</p>
            </div>
            <div className="text-center p-3 bg-blue-900/40 rounded-lg hover:bg-blue-900/70 transition-all">
              <FaGlobe className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xs font-semibold">{getLabel(footerLabels.onlineServices)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-blue-950/70 border-t border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-blue-200 text-xs tracking-wide">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-yellow-400">{getLabel(footerLabels.departmentName)}</span>, {getLabel(footerLabels.governmentOfNepal)}. {getLabel(footerLabels.allRightsReserved)}
            </div>
            <div className="flex space-x-6 text-xs">
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

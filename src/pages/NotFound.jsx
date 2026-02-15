import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaExclamationTriangle, FaRocket } from 'react-icons/fa';
import { useLang } from '../context/LanguageContext';
import { notFoundLabels } from '../labels/notFoundLabels';

function NotFound() {
  const navigate = useNavigate();
  const { getLabel } = useLang();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* 3D Card Container */}
        <div 
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 transform transition-transform duration-300 hover:scale-105"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale3d(1, 1, 1)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 404 Number */}
          <div className="relative mb-8">
            <div className="text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
              404
            </div>
            <div className="absolute inset-0 text-9xl font-black text-white/5 blur-sm">
              404
            </div>
          </div>

          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-2xl animate-bounce">
              <FaExclamationTriangle className="text-white text-3xl" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            {getLabel(notFoundLabels.pageNotFound)}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {getLabel(notFoundLabels.description)}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <button
              onClick={handleGoHome}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <FaHome className="text-lg" />
                <span>{getLabel(notFoundLabels.goToHomepage)}</span>
                <FaRocket className="text-lg transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>

            <button
              onClick={handleGoBack}
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-2">
                <FaArrowLeft className="text-lg transform group-hover:-translate-x-1 transition-transform duration-300" />
                <span>{getLabel(notFoundLabels.goBack)}</span>
              </div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 animate-fade-in-up delay-400">
            <p className="text-gray-400 text-sm">
              {getLabel(notFoundLabels.errorContact)}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>


    </div>
  );
}

export default NotFound; 
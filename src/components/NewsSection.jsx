import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import { newsSectionLabels } from "../labels/newsSectionLabels";

function NewsSection() {
  const { getLabel } = useLang();
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/news/public/active?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setNews(data.result || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto change image every 3s
  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [index, news.length]);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % news.length);
  };

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-nepal-blue mb-4">📰 {getLabel(newsSectionLabels.latestNews)}</h2>
        <div className="w-full h-120 rounded-lg bg-gray-200 animate-pulse"></div>
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-nepal-blue mb-4">📰 {getLabel(newsSectionLabels.latestNews)}</h2>
        <div className="w-full h-120 rounded-lg bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500 text-lg">{getLabel(newsSectionLabels.noNewsAvailable)}</p>
        </div>
      </section>
    );
  }

  const current = news[index];

  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-nepal-blue mb-4 sm:mb-6 tracking-tight flex items-center gap-2">
        <span role="img" aria-label="news">📰</span> {getLabel(newsSectionLabels.latestNews)}
      </h2>

      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-nepal-blue bg-gradient-to-br from-blue-50 via-white to-blue-100 transition-all duration-500 min-h-[220px] sm:min-h-[320px]">
        <img
          src={`${import.meta.env.VITE_API_URL}/public/uploads/news/${current.image}`}
          alt="news"
          className="w-full h-60 sm:h-80 md:h-[450px] lg:h-[550px] object-cover transition-transform duration-700 scale-105 hover:scale-110 blur-0"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
          }}
        />

        {/* Overlay text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end animate-fadeIn">
          <div className="p-8 text-white w-full">
            <div className="text-2xl font-bold mb-3 drop-shadow-lg animate-slideUp">{current.title}</div>
            <div className="text-base opacity-95 drop-shadow-md animate-slideUp delay-100">{current.content.substring(0, 150)}...</div>
          </div>
        </div>

        {/* Left Arrow */}
        {news.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-nepal-blue hover:text-white shadow-lg p-3 rounded-full text-nepal-blue transition-all duration-300 z-10 animate-fadeIn"
            aria-label={getLabel(newsSectionLabels.previousNews)}
          >
            <FaChevronLeft size={22} />
          </button>
        )}

        {/* Right Arrow */}
        {news.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-nepal-blue hover:text-white shadow-lg p-3 rounded-full text-nepal-blue transition-all duration-300 z-10 animate-fadeIn"
            aria-label={getLabel(newsSectionLabels.nextNews)}
          >
            <FaChevronRight size={22} />
          </button>
        )}

        {/* Dots indicator */}
        {news.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 animate-fadeIn">
            {news.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                  i === index
                    ? 'bg-nepal-blue scale-125 shadow-lg'
                    : 'bg-white bg-opacity-60 hover:bg-nepal-blue/70'
                }`}
                aria-label={`${getLabel(newsSectionLabels.goToNews)} ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s cubic-bezier(.4,0,.2,1);
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp {
            animation: slideUp 0.7s cubic-bezier(.4,0,.2,1);
          }
          .delay-100 {
            animation-delay: 0.1s;
          }
        `}
      </style>
    </section>
  );
}

export default NewsSection;

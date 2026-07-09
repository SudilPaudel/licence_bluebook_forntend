import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [index, news.length]);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % news.length);
  };

  const sectionTitle = (
    <h2 className="text-2xl sm:text-3xl font-bold text-nepal-blue mb-4 sm:mb-6 tracking-tight border-b border-slate-200 pb-3">
      {getLabel(newsSectionLabels.latestNews)}
    </h2>
  );

  const sliderHeights = "h-72 sm:h-96 md:h-[520px] lg:h-[620px]";

  if (loading) {
    return (
      <section className="mt-8">
        {sectionTitle}
        <div className={`w-full ${sliderHeights} rounded-lg bg-slate-200 animate-pulse`} />
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="mt-8">
        {sectionTitle}
        <div className={`w-full ${sliderHeights} rounded-lg bg-white border border-slate-200 flex items-center justify-center`}>
          <p className="text-slate-500 text-base">{getLabel(newsSectionLabels.noNewsAvailable)}</p>
        </div>
      </section>
    );
  }

  const current = news[index];

  return (
    <section className="mt-10 sm:mt-12">
      {sectionTitle}

      <div className={`relative w-full ${sliderHeights} rounded-lg overflow-hidden shadow-sm border border-slate-200 bg-slate-100`}>
        <Link
          to={`/news/${current._id}`}
          className="absolute inset-0 z-[1] group"
          aria-label={`${getLabel(newsSectionLabels.viewDetails)}: ${current.title}`}
        >
          <img
            src={`${import.meta.env.VITE_API_URL}/public/uploads/news/${current.image}`}
            alt={current.title}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center transition-[filter] group-hover:brightness-95"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1lcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNjY3Mzg3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2Ugbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end pointer-events-none">
            <div className="p-6 sm:p-8 text-white w-full">
              <div className="text-xl sm:text-2xl font-bold mb-2">{current.title}</div>
              <div className="text-sm sm:text-base text-slate-100 line-clamp-2">
                {current.content.substring(0, 150)}...
              </div>
              <span className="inline-block mt-3 text-sm font-semibold text-white/90 underline underline-offset-2">
                {getLabel(newsSectionLabels.readMore)}
              </span>
            </div>
          </div>
        </Link>

        {/* Left Arrow */}
        {news.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 bg-white/90 hover:bg-nepal-blue hover:text-white shadow p-2.5 rounded-full text-nepal-blue transition-colors z-10"
            aria-label={getLabel(newsSectionLabels.previousNews)}
          >
            <FaChevronLeft size={18} />
          </button>
        )}

        {/* Right Arrow */}
        {news.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="absolute top-1/2 right-4 sm:right-6 -translate-y-1/2 bg-white/90 hover:bg-nepal-blue hover:text-white shadow p-2.5 rounded-full text-nepal-blue transition-colors z-10"
            aria-label={getLabel(newsSectionLabels.nextNews)}
          >
            <FaChevronRight size={18} />
          </button>
        )}

        {/* Dots indicator */}
        {news.length > 1 && (
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {news.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`w-2.5 h-2.5 rounded-full border border-white transition-colors ${
                  i === index ? "bg-nepal-blue" : "bg-white/60 hover:bg-white/90"
                }`}
                aria-label={`${getLabel(newsSectionLabels.goToNews)} ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NewsSection;

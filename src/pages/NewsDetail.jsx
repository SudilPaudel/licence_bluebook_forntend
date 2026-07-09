import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaNewspaper } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import { newsDetailLabels } from "../labels/newsDetailLabels";
import { formatAdDateTimeForDisplay } from "../utils/dateUtils";

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLabel, language } = useLang();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/news/public/${id}`);
        if (response.ok) {
          const data = await response.json();
          setNews(data.result);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-64 sm:h-80 bg-slate-200 rounded-lg" />
          <div className="h-8 w-3/4 bg-slate-200 rounded" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !news) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16 flex items-center justify-center">
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <FaNewspaper className="mx-auto h-10 w-10 text-nepal-blue mb-4" />
          <h1 className="text-xl font-bold text-slate-900">{getLabel(newsDetailLabels.notFound)}</h1>
          <p className="mt-2 text-sm text-slate-600">{getLabel(newsDetailLabels.notFoundDesc)}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-nepal-blue hover:underline"
          >
            <FaArrowLeft size={12} />
            {getLabel(newsDetailLabels.backToHome)}
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = formatAdDateTimeForDisplay(
    news.publishedAt || news.createdAt,
    language
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-medium text-nepal-blue hover:underline"
          >
            <FaArrowLeft size={12} />
            {getLabel(newsDetailLabels.backToHome)}
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-8 sm:py-10">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {news.image && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-100">
              <img
                src={`${import.meta.env.VITE_API_URL}/public/uploads/news/${news.image}`}
                alt={news.title}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-nepal-blue">
              {getLabel(newsDetailLabels.department)}
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {news.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 border-b border-slate-100 pb-5">
              <span className="inline-flex items-center gap-2">
                <FaCalendarAlt className="text-nepal-blue" />
                {getLabel(newsDetailLabels.publishedOn)}: {publishedDate}
              </span>
            </div>

            {news.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {news.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-nepal-blue border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
              {news.content}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default NewsDetail;

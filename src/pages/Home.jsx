import NewsSection from "../components/NewsSection";
import GuidanceSection from "../components/GuidanceSection.jsx";

/**
 * Home component renders the landing page with hero, news, and guidance sections.
 */
function Home() {
  // Renders the main home/landing page layout
  return (
    <div className="px-6 py-12 space-y-16 bg-gradient-to-br from-blue-50 to-white min-h-screen animate-fade-in">
      {/* Hero */}
      <section className="relative text-center bg-white/80 p-12 rounded-3xl shadow-2xl overflow-hidden border border-blue-100 animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-tr from-nepal-blue/10 to-blue-200/10 pointer-events-none rounded-3xl" />
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-nepal-blue drop-shadow-lg tracking-tight animate-fade-in-down">
          Welcome to the Blue Book Renewal System
        </h1>
        <p className="relative z-10 mt-5 text-gray-700 text-xl md:text-2xl font-medium animate-fade-in-up">
          Register and renew your vehicle documents easily and securely.
        </p>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-nepal-blue/10 rounded-full blur-2xl animate-pulse" />
      </section>

      {/* News */}
      <div className="animate-fade-in-up">
        <NewsSection />
      </div>

      {/* Guidance */}
      <div className="animate-fade-in-up delay-200">
        <GuidanceSection />
      </div>
    </div>
  );
}

export default Home;

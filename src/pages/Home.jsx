import { useState } from "react";
import NewsSection from "../components/NewsSection";
import GuidanceSection from "../components/GuidanceSection.jsx";
import ExperimentalDisclaimerModal from "../components/ExperimentalDisclaimerModal";
import { useLang } from "../context/LanguageContext";
import { homeLabels } from "../labels/homeLabels";

/**
 * Home component renders the landing page with hero, news, and guidance sections.
 */
function Home() {
  const { getLabel } = useLang();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <>
      <ExperimentalDisclaimerModal
        isOpen={showDisclaimer}
        onAcknowledge={() => setShowDisclaimer(false)}
      />

      <div className="px-6 py-12 space-y-16 bg-slate-50 min-h-screen">
        {/* Hero */}
        <section className="text-center bg-white p-10 md:p-12 rounded-lg border border-slate-200 border-t-4 border-t-nepal-blue shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold text-nepal-blue tracking-tight">
            {getLabel(homeLabels.welcome)}
          </h1>
          <p className="mt-4 text-slate-600 text-lg md:text-xl font-normal max-w-3xl mx-auto leading-relaxed">
            {getLabel(homeLabels.registerAndRenew)}
          </p>
        </section>

        {/* News */}
        <div>
          <NewsSection />
        </div>

        {/* Guidance */}
        <div>
          <GuidanceSection />
        </div>
      </div>
    </>
  );
}

export default Home;

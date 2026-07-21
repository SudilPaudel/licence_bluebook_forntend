import { useEffect, useRef } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { useLang } from "../context/LanguageContext";
import { disclaimerLabels } from "../labels/disclaimerLabels";

function ExperimentalDisclaimerModal({ isOpen, onAcknowledge }) {
  const { getLabel } = useLang();
  const acknowledgeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    acknowledgeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-description"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 bg-white/20 rounded-full p-2.5">
              <FaExclamationTriangle className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-100">
                {getLabel(disclaimerLabels.badge)}
              </p>
              <h2
                id="disclaimer-title"
                className="text-lg md:text-xl font-bold text-white leading-snug mt-0.5"
              >
                {getLabel(disclaimerLabels.title)}
              </h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5" id="disclaimer-description">
          <p className="text-slate-600 leading-relaxed">
            {getLabel(disclaimerLabels.intro)}
          </p>

          <ul className="space-y-2.5">
            {[disclaimerLabels.point1, disclaimerLabels.point2].map((point) => (
              <li key={point.en} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"
                  aria-hidden="true"
                />
                <span>{getLabel(point)}</span>
              </li>
            ))}
          </ul>

          <button
            ref={acknowledgeButtonRef}
            type="button"
            onClick={onAcknowledge}
            className="w-full px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-nepal-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-nepal-blue focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {getLabel(disclaimerLabels.acknowledge)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExperimentalDisclaimerModal;

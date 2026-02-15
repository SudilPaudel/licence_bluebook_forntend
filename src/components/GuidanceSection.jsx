import React from "react";
import { useLang } from "../context/LanguageContext";
import { guidanceSectionLabels } from "../labels/guidanceSectionLabels";

function GuidanceSection() {
  const { getLabel, language } = useLang();

  // Nepali numbers mapping
  const nepaliNumbers = ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
  const getNumber = (num) => language === 'ne' ? nepaliNumbers[num - 1] : num;

  return (
    <section className="mt-16 px-4 md:px-12 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-3xl shadow-2xl animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-extrabold text-nepal-blue mb-10 text-center tracking-tight drop-shadow-lg animate-slide-down">
        📘 {getLabel(guidanceSectionLabels.howToRegisterOrRenew)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Registration Guide */}
        <div className="bg-white/90 shadow-xl p-8 rounded-2xl border-l-8 border-nepal-blue hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
          <h3 className="text-2xl font-bold text-nepal-red mb-4 flex items-center gap-2">
            <span className="animate-bounce">🔰</span> {getLabel(guidanceSectionLabels.newRegistration)}
          </h3>
          <div className="text-gray-700 space-y-3 text-lg leading-relaxed">
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(1)}.</span>{getLabel(guidanceSectionLabels.goToRegistrationPage)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(2)}.</span>{getLabel(guidanceSectionLabels.fillPersonalAndVehicleDetails)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(3)}.</span>{getLabel(guidanceSectionLabels.uploadRequiredDocuments)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(4)}.</span>{getLabel(guidanceSectionLabels.submitFormForReview)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(5)}.</span>{getLabel(guidanceSectionLabels.receiveConfirmation)}</div>
          </div>
        </div>

        {/* Renewal Guide */}
        <div className="bg-white/90 shadow-xl p-8 rounded-2xl border-l-8 border-nepal-blue hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up delay-150">
          <h3 className="text-2xl font-bold text-nepal-red mb-4 flex items-center gap-2">
            <span className="animate-spin-slow">🔁</span> {getLabel(guidanceSectionLabels.renewalProcess)}
          </h3>
          <div className="text-gray-700 space-y-3 text-lg leading-relaxed">
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(1)}.</span>{getLabel(guidanceSectionLabels.loginToAccount)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(2)}.</span>{getLabel(guidanceSectionLabels.goToRenewalSection)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(3)}.</span>{getLabel(guidanceSectionLabels.verifyVehicleInfo)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(4)}.</span>{getLabel(guidanceSectionLabels.payRenewalFee)}</div>
            <div className="transition-colors duration-200 hover:text-nepal-blue"><span className="font-semibold mr-2">{getNumber(5)}.</span>{getLabel(guidanceSectionLabels.downloadRenewedBluebook)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GuidanceSection;

import React from "react";
import { useLang } from "../context/LanguageContext";
import { guidanceSectionLabels } from "../labels/guidanceSectionLabels";

function GuidanceSection() {
  const { getLabel, language } = useLang();

  const nepaliNumbers = ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०"];
  const getNumber = (num) => (language === "ne" ? nepaliNumbers[num - 1] : num);

  const registrationSteps = [
    guidanceSectionLabels.goToRegistrationPage,
    guidanceSectionLabels.fillPersonalAndVehicleDetails,
    guidanceSectionLabels.uploadRequiredDocuments,
    guidanceSectionLabels.submitFormForReview,
    guidanceSectionLabels.receiveConfirmation,
  ];

  const renewalSteps = [
    guidanceSectionLabels.loginToAccount,
    guidanceSectionLabels.goToRenewalSection,
    guidanceSectionLabels.verifyVehicleInfo,
    guidanceSectionLabels.payRenewalFee,
    guidanceSectionLabels.downloadRenewedBluebook,
  ];

  const renderSteps = (steps) => (
    <div className="text-slate-700 space-y-3 text-base leading-relaxed">
      {steps.map((step, i) => (
        <div key={getLabel(step)} className="flex gap-2">
          <span className="font-semibold text-nepal-blue shrink-0">{getNumber(i + 1)}.</span>
          <span>{getLabel(step)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="mt-16 px-4 md:px-12 py-10 bg-white rounded-lg border border-slate-200 shadow-sm">
      <h2 className="text-2xl md:text-3xl font-bold text-nepal-blue mb-10 text-center tracking-tight border-b border-slate-100 pb-4">
        {getLabel(guidanceSectionLabels.howToRegisterOrRenew)}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Registration Guide */}
        <div className="bg-slate-50 p-8 rounded-lg border border-slate-200 border-l-4 border-l-nepal-blue">
          <h3 className="text-xl font-bold text-nepal-red mb-5 pb-3 border-b border-slate-200">
            {getLabel(guidanceSectionLabels.newRegistration)}
          </h3>
          {renderSteps(registrationSteps)}
        </div>

        {/* Renewal Guide */}
        <div className="bg-slate-50 p-8 rounded-lg border border-slate-200 border-l-4 border-l-nepal-blue">
          <h3 className="text-xl font-bold text-nepal-red mb-5 pb-3 border-b border-slate-200">
            {getLabel(guidanceSectionLabels.renewalProcess)}
          </h3>
          {renderSteps(renewalSteps)}
        </div>
      </div>
    </section>
  );
}

export default GuidanceSection;

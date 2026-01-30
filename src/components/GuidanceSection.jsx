import React from "react";

function GuidanceSection() {
  return (
    <section className="mt-16 px-4 md:px-12 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-3xl shadow-2xl animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-extrabold text-nepal-blue mb-10 text-center tracking-tight drop-shadow-lg animate-slide-down">
        📘 How to Register or Renew Your Blue Book
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Registration Guide */}
        <div className="bg-white/90 shadow-xl p-8 rounded-2xl border-l-8 border-nepal-blue hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
          <h3 className="text-2xl font-bold text-nepal-red mb-4 flex items-center gap-2">
            <span className="animate-bounce">🔰</span> New Registration
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 text-lg leading-relaxed">
            <li className="transition-colors duration-200 hover:text-nepal-blue">Go to the Registration page.</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Fill in your personal and vehicle details.</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Upload required documents (citizenship, vehicle bill, etc.).</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Submit the form for review.</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Receive confirmation via email/SMS.</li>
          </ol>
        </div>

        {/* Renewal Guide */}
        <div className="bg-white/90 shadow-xl p-8 rounded-2xl border-l-8 border-nepal-blue hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up delay-150">
          <h3 className="text-2xl font-bold text-nepal-red mb-4 flex items-center gap-2">
            <span className="animate-spin-slow">🔁</span> Renewal Process
          </h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 text-lg leading-relaxed">
            <li className="transition-colors duration-200 hover:text-nepal-blue">Log in to your account.</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Go to the Renewal section.</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Verify vehicle information.</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Pay the renewal fee online.</li>
            <li className="transition-colors duration-200 hover:text-nepal-blue">Download the renewed Blue Book or receive it via mail.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default GuidanceSection;

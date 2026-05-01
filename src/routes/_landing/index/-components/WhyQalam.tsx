import React from "react";
import { useTranslation } from "react-i18next";

const FEATURE_KEYS = ["quality", "safety", "tracking", "support"] as const;

const FEATURE_ICONS: Record<(typeof FEATURE_KEYS)[number], React.ReactNode> = {
  quality: (
    <svg className="w-8 h-8 text-sky-50 dark:text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  safety: (
    <svg className="w-8 h-8 text-sky-50 dark:text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  tracking: (
    <svg className="w-8 h-8 text-sky-50 dark:text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  support: (
    <svg className="w-8 h-8 text-sky-50 dark:text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

const Features: React.FC = () => {
  const { t } = useTranslation("landing");

  return (
    <section className="py-24 bg-sky-50 dark:bg-slate-900/50 transition-colors duration-500">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        <div className="text-center space-y-4 mb-20 relative">
          <h2 className="text-5xl md:text-6xl font-bold text-sky-950 dark:text-white relative z-10 transition-colors">
            {t("whyQalam.heading")}
          </h2>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-6xl font-bold text-teal-500/10 dark:text-teal-400/5 blur-sm pointer-events-none select-none">
            {t("whyQalam.heading")}
          </div>
          <p className="text-xl md:text-2xl text-teal-500 dark:text-teal-400 font-medium">
            {t("whyQalam.subheading")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURE_KEYS.map((key) => (
            <div
              key={key}
              className="relative p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl border border-zinc-50 dark:border-white/5 hover:border-teal-500 dark:hover:border-teal-500 transition-all group flex flex-col items-start gap-6"
            >
              <div className="absolute top-0 left-0 rounded-2xl transition-colors">
                <img src="/qalam-why-shape.svg" alt="Why Qalam Shape" />
              </div>
              <div className="w-16 h-16 bg-sky-950 dark:bg-teal-500 group-hover:bg-teal-500 dark:group-hover:bg-teal-400 rounded-xl flex justify-center items-center transition-colors">
                {FEATURE_ICONS[key]}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-sky-950 dark:text-white transition-colors">
                  {t(`whyQalam.features.${key}.title`)}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed text-justify">
                  {t(`whyQalam.features.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

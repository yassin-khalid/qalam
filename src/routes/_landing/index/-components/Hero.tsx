import React from "react";
import { useTranslation } from "react-i18next";

const Hero: React.FC = () => {
  const { t } = useTranslation("landing");
  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden transition-colors duration-500">
      {/* Decorative Background Circles */}
      <div className="absolute -top-[500px] -right-[500px] w-[1200px] h-[1200px] bg-sky-100 dark:bg-teal-900/10 rounded-full blur-[120px] opacity-60 z-0"></div>
      <div className="absolute -bottom-[200px] -left-[200px] w-[800px] h-[800px] bg-teal-100 dark:bg-sky-900/10 rounded-full blur-[120px] opacity-40 z-0"></div>

      <div className="max-w-full mx-auto px-6 md:px-12 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="order-2 md:order-1 flex flex-col items-start gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-teal-500 dark:text-teal-400 leading-tight">
              {t("hero.titleHighlight")}
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-sky-950 dark:text-white leading-relaxed max-w-xl transition-colors">
              {t("hero.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-sky-950 dark:bg-teal-500 text-white dark:text-slate-950 px-10 py-4 rounded-xl font-bold text-xl shadow-xl hover:translate-y-[-2px] transition-all">
              {t("hero.registerCta")}
            </button>
            <button className="border-2 border-sky-950 dark:border-teal-500/50 text-sky-950 dark:text-teal-400 px-10 py-4 rounded-xl font-medium text-lg hover:bg-sky-950 dark:hover:bg-teal-500 hover:text-white dark:hover:text-slate-950 transition-all shadow-md">
              {t("hero.downloadAppCta")}
            </button>
          </div>
        </div>

        {/* Visual Content */}
        <div className="order-1 md:order-2 relative flex justify-center items-center">
          <div className="relative w-full max-w-[500px] aspect-square group">
            <div className="absolute inset-0 bg-sky-50 dark:bg-slate-900 rounded-full transition-colors"></div>
            <img
              src="/qalam-hero-img.svg"
              alt={t("hero.imageAlt")}
              className="absolute inset-0 w-full h-full object-cover rounded-[220px] rotate-[-5deg] group-hover:rotate-0 transition-transform duration-700"
            />
            {/* Floating Accents */}
            <div className="absolute -top-10 -left-10 w-24 h-12 rotate-[-16deg] rounded-lg hidden md:block transition-colors">
              <img
                src="/qalam-logo-shape.svg"
                alt="Accent"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-10 -right-5 w-32 h-16 bg-teal-500/20 rounded-xl blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

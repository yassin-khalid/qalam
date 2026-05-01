import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const STEP_KEYS = ["register", "pickTeacher", "startLesson", "review"] as const;

const HowItWorks: React.FC = () => {
  const { t } = useTranslation("landing");
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  return (
    <section className="py-24 bg-sky-50 dark:bg-slate-900/50 transition-colors duration-500">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-sky-950 dark:text-white transition-colors">
            {t("howItWorks.heading")}
          </h2>
          <p className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-400 font-normal transition-colors">
            {t("howItWorks.subheading")}
          </p>

          <div className="inline-flex bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-teal-500/10 dark:border-white/5 transition-colors">
            <button
              onClick={() => setActiveTab("student")}
              className={`px-12 py-3 rounded-xl text-xl font-medium transition-all ${activeTab === "student" ? "bg-linear-to-b from-teal-500 to-sky-950 dark:to-teal-900 text-white shadow-lg" : "text-gray-600 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5"}`}
            >
              {t("howItWorks.tabs.students")}
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={`px-12 py-3 rounded-xl text-xl font-medium transition-all ${activeTab === "teacher" ? "bg-linear-to-b from-teal-500 to-sky-950 dark:to-teal-900 text-white shadow-lg" : "text-gray-600 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5"}`}
            >
              {t("howItWorks.tabs.teachers")}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEP_KEYS.map((key, i) => (
            <div
              key={key}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg dark:shadow-2xl border border-teal-500/10 dark:border-white/5 hover:translate-y-[-5px] transition-all flex flex-col items-center text-center gap-6"
            >
              <div className="w-1/2">
                <img
                  src={`/qalam-how-0${i + 1}.svg`}
                  alt={`Qalam How ${i + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-bold text-sky-950 dark:text-white transition-colors">
                  {t(`howItWorks.steps.${key}.title`)}
                </h4>
                <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed transition-colors">
                  {t(`howItWorks.steps.${key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

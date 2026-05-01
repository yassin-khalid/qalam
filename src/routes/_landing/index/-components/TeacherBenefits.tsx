import React from "react";
import { useTranslation } from "react-i18next";

const BENEFIT_KEYS = [
  "careerPath",
  "studentAppreciation",
  "flexibility",
  "analytics",
  "financial",
] as const;

const TeacherBenefits: React.FC = () => {
  const { t } = useTranslation("landing");

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        <div className="w-full space-y-12 order-2 lg:order-1">
          <div className="flex gap-4 items-center">
            <div className="w-1.5 h-32 flex flex-col">
              <img
                src="/qalam-logo-pen.svg"
                alt="Qalam Logo Pen"
                className="w-full h-full object-contain scale-150"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-teal-500 dark:text-teal-400">
                {t("teacherBenefits.heading")}
              </h2>
              <p className="text-xl font-semibold text-sky-950 dark:text-white transition-colors">
                {t("teacherBenefits.subheading")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center justify-between w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 order-2 lg:order-1">
              {BENEFIT_KEYS.map((key, i) => (
                <React.Fragment key={key}>
                  <div className="space-y-2">
                    <div
                      className={`w-12 ${(i + 1) % 2 === 0 ? "scale-150 mb-8" : "scale-100"
                        }`}
                    >
                      <img
                        src={`qalam-benefit-${i + 1}.svg`}
                        alt={`Qalam Benefit ${i + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>

                    <h4 className="text-2xl font-bold text-sky-950 dark:text-teal-400 transition-colors">
                      {t(`teacherBenefits.items.${key}.title`)} :
                    </h4>

                    <p className="text-stone-900/75 dark:text-zinc-400 text-sm font-semibold leading-relaxed transition-colors">
                      {t(`teacherBenefits.items.${key}.desc`)}
                    </p>
                  </div>

                  {/* Empty column after second item (lg only) */}
                  {i === 1 && (
                    <div className="hidden lg:block" aria-hidden />
                  )}
                </React.Fragment>
              ))}
            </div>


            <div className="order-1 lg:order-2">
              <div className="relative group flex justify-center items-center">
                <img
                  src="/qalam-teacher-benefits.svg"
                  alt="Teacher success"
                  className="relative rounded-3xl w-2/3 h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherBenefits;

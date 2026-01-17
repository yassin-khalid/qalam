import React from "react";

const TeacherBenefits: React.FC = () => {
  const benefits = [
    {
      title: "تخطيط مسار مهني",
      desc: "نظام ذكي يساعدك على تحديد أهدافك التعليمية وتتبع إنجازاتك ونموك المهني بشكل منظم وواضح",
    },
    {
      title: "تقدير الطلبة",
      desc: "نقوّي العلاقة بينك وبين طلابك من خلال نظام تقييمات موثوق يُبرز خبرتك ويعزز ثقة المجتمع التعليمي بك",
    },
    {
      title: "المرونة والتحكم",
      desc: "تحكّم كامل في جدولك وأوقاتك التعليمية، مع حرية اختيار الطلاب والمواد التي تفضل تدريسها",
    },
    {
      title: "التتبع والتحليل",
      desc: "أدوات تحليلية متقدمة توفر لك رؤى دقيقة حول أدائك ومدى تقدم طلابك لتحسين جودة التدريس",
    },
    {
      title: "التقدم المالي",
      desc: "تحصل على عوائد عادلة ومجزية مقابل خدماتك التعليمية، مع ضمان التحويل الآمن والسريع لأرباحك",
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        <div className="w-full space-y-12 order-2 lg:order-1">
          <div className="flex gap-4 items-center">
            <div className="w-1.5 h-32 flex flex-col">
              {/* <div className="h-1/4 bg-teal-500"></div>
                <div className="h-1/2 bg-sky-950 dark:bg-white transition-colors"></div>
                <div className="h-1/4 bg-teal-500"></div> */}
              <img
                src="/qalam-logo-pen.svg"
                alt="Qalam Logo Pen"
                className="w-full h-full object-contain scale-150"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-teal-500 dark:text-teal-400">
                مزايا انضمامك كمعلم
              </h2>
              <p className="text-xl font-semibold text-sky-950 dark:text-white transition-colors">
                رحلة تعليمية احترافية تمنحك الأدوات والدعم لتحقيق التميز والنجاح
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center justify-between w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 order-2 lg:order-1">
              {/* {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className={`space-y-2 ${
                    i < 2 ? "md:col-span-3" : "md:col-span-2"
                  }`}
                >
                  <div
                    className={`w-12 ${(i + 1) % 2 === 0 ? "scale-150 mb-8" : "scale-100"}`}
                  >
                    <img
                      src={`qalam-benefit-${i + 1}.svg`}
                      alt={`Qalam Benefit ${i + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <h4 className="text-2xl font-bold text-sky-950 dark:text-teal-400 transition-colors">
                    {benefit.title} :
                  </h4>

                  <p className="text-stone-900/75 dark:text-zinc-400 text-sm font-semibold leading-relaxed transition-colors">
                    {benefit.desc}
                  </p>
                </div>
              ))}*/}
              {benefits.map((benefit, i) => (
                <React.Fragment key={i}>
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
                      {benefit.title} :
                    </h4>

                    <p className="text-stone-900/75 dark:text-zinc-400 text-sm font-semibold leading-relaxed transition-colors">
                      {benefit.desc}
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
                {/* <div className="absolute inset-0 bg-linear-to-b from-teal-500 to-sky-950 dark:to-teal-900 rounded-3xl rotate-3 scale-105 opacity-20 group-hover:rotate-0 transition-transform duration-500"></div> */}
                <img
                  src="/qalam-teacher-benefits.svg"
                  alt="Teacher success"
                  className="relative rounded-3xl w-2/3 h-auto object-cover"
                />
                {/* <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherBenefits;

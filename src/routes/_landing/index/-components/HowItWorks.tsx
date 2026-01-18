import React, { useState } from "react";

const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  const steps = [
    {
      num: "10",
      title: "سجل حسابك",
      desc: "أنشئ حسابك الشخصي بسهولة وابدأ رحلتك التعليمية معنا",
    },
    {
      num: "20",
      title: "اختر معلمك",
      desc: "تصفح قائمة المعلمين المعتمدين واختر الأنسب لاحتياجاتك",
    },
    {
      num: "30",
      title: "ابدأ الدرس",
      desc: "تواصل مباشرة مع المعلم وابدأ دروسك في بيئة تفاعلية",
    },
    {
      num: "40",
      title: "قيّم التجربة",
      desc: "شارك تقييمك وملاحظاتك لمساعدة المجتمع التعليمي في التطوير المستمر",
    },
  ];

  return (
    <section className="py-24 bg-sky-50 dark:bg-slate-900/50 transition-colors duration-500">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-sky-950 dark:text-white transition-colors">
            كيف تعمل المنصة
          </h2>
          <p className="text-xl md:text-2xl text-zinc-900 dark:text-zinc-400 font-normal transition-colors">
            رحلتك التعليمية في خطوات بسيطة وواضحة
          </p>

          <div className="inline-flex bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-teal-500/10 dark:border-white/5 transition-colors">
            <button
              onClick={() => setActiveTab("student")}
              className={`px-12 py-3 rounded-xl text-xl font-medium transition-all ${activeTab === "student" ? "bg-linear-to-b from-teal-500 to-sky-950 dark:to-teal-900 text-white shadow-lg" : "text-gray-600 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5"}`}
            >
              للطلاب
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={`px-12 py-3 rounded-xl text-xl font-medium transition-all ${activeTab === "teacher" ? "bg-linear-to-b from-teal-500 to-sky-950 dark:to-teal-900 text-white shadow-lg" : "text-gray-600 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5"}`}
            >
              للمعلمين
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg dark:shadow-2xl border border-teal-500/10 dark:border-white/5 hover:translate-y-[-5px] transition-all flex flex-col items-center text-center gap-6"
            >
              {/* <div className="text-sky-50 dark:text-teal-500/10 text-8xl font-black opacity-30 select-none transition-colors">
                {step.num}
              </div> */}
              <div className="w-1/2">
                <img
                  src={`/qalam-how-0${i + 1}.svg`}
                  alt={`Qalam How ${i + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-bold text-sky-950 dark:text-white transition-colors">
                  {step.title}
                </h4>
                <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed transition-colors">
                  {step.desc}
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

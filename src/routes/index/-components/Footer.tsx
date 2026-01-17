import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-linear-to-t from-cyan-500/50 to-cyan-500/20 dark:from-cyan-950/50 dark:to-cyan-900/50 w-full lg:px-10 lg:pb-10 lg:py-10 pt-10">
      <div className="bg-sky-950 dark:bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative transition-colors duration-500 lg:rounded-2xl">
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 lg:px-36 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                معلومات عنا
              </h3>
              <p className="text-zinc-300 dark:text-zinc-400 text-base leading-relaxed text-justify">
                نحن فريق من المصممين والمهندسين والمبتكرين نعيد تعريف التعليم
                باستخدام الذكاء الاصطناعي. مهمتنا هي جعل كل رحلة تعليمية أكثر
                ذكاءً ومرونة وسهولة لكل من المعلمين والطلاب.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                روابط مفيدة
              </h3>
              <ul className="space-y-4 text-zinc-300 dark:text-zinc-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    حول المنصة
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    الخدمات
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    فريق العمل
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    الأسعار
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                المساعدة
              </h3>
              <ul className="space-y-4 text-zinc-300 dark:text-zinc-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    دعم العملاء
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    الشروط والأحكام
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    سياسة الخصوصية
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                  >
                    اتصل بنا
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                تواصل معنا
              </h3>
              <ul className="space-y-4 text-zinc-300 dark:text-zinc-400">
                <li className="flex items-start gap-3">
                  <span>📍</span>
                  <span>
                    45 شارع المسجد الحرام، مكة، 21955، المملكة العربية السعودية
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span>📞</span>
                  <span dir="ltr">+966 500 000 000</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>✉️</span>
                  <span>info@qalam.sa</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-teal-500/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-400">© 2026 قلم - جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              {["twitter", "github", "facebook", "google"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/20 flex justify-center items-center hover:bg-teal-500 hover:border-teal-500 transition-all capitalize"
                >
                  {/* {social[0]} */}
                  <img
                    src={`/qalam-footer-${social}.svg`}
                    alt={`Qalam Footer ${social}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute lg:top-0 bottom-0 left-0">
          <img
            src="/qalam-footer-shape.svg"
            alt="Qalam Footer Shape"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

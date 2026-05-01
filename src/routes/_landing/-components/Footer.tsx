import React from "react";
import { useTranslation } from "react-i18next";

const LINK_KEYS = ["about", "services", "team", "pricing"] as const;
const HELP_KEYS = ["support", "terms", "privacy", "contact"] as const;

const Footer: React.FC = () => {
  const { t } = useTranslation("landing");

  return (
    <footer className="bg-linear-to-t from-cyan-500/50 to-cyan-500/20 dark:from-cyan-950/50 dark:to-cyan-900/50 w-full lg:px-10 lg:pb-10 lg:py-10 pt-10">
      <div className="bg-sky-950 dark:bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative transition-colors duration-500 lg:rounded-2xl">
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 lg:px-36 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                {t("footer.aboutTitle")}
              </h3>
              <p className="text-zinc-300 dark:text-zinc-400 text-base leading-relaxed text-justify">
                {t("footer.aboutText")}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                {t("footer.usefulLinks")}
              </h3>
              <ul className="space-y-4 text-zinc-300 dark:text-zinc-400">
                {LINK_KEYS.map((key) => (
                  <li key={key}>
                    <a
                      href="#"
                      className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                    >
                      {t(`footer.links.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                {t("footer.helpTitle")}
              </h3>
              <ul className="space-y-4 text-zinc-300 dark:text-zinc-400">
                {HELP_KEYS.map((key) => (
                  <li key={key}>
                    <a
                      href="#"
                      className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                    >
                      {t(`footer.help.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-teal-500 dark:text-teal-400">
                {t("footer.contactTitle")}
              </h3>
              <ul className="space-y-4 text-zinc-300 dark:text-zinc-400">
                <li className="flex items-start gap-3">
                  <span>📍</span>
                  <span>{t("footer.address")}</span>
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
            <p className="text-zinc-400">{t("footer.rights")}</p>
            <div className="flex gap-4">
              {["twitter", "github", "facebook", "google"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/20 flex justify-center items-center hover:bg-teal-500 hover:border-teal-500 transition-all capitalize"
                >
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

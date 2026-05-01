import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import arCommon from "./locales/ar/common";
import arLanding from "./locales/ar/landing";
import enCommon from "./locales/en/common";
import enLanding from "./locales/en/landing";

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";

export const LOCALE_DIRECTION: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};

export const resources = {
  ar: {
    common: arCommon,
    landing: arLanding,
  },
  en: {
    common: enCommon,
    landing: enLanding,
  },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: "common",
    ns: ["common", "landing"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;

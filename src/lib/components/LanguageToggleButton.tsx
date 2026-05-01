import { ButtonHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { useLocale } from "../hooks/useLocale";
import { updateLocale } from "../utils/sessionHelpers";
import type { Locale } from "../i18n";

const LanguageToggleButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
    const locale = useLocale();
    const { t } = useTranslation("common");
    const next: Locale = locale === "ar" ? "en" : "ar";
    const label = next === "en" ? "EN" : "ع";

    return (
        <button
            onClick={() => updateLocale(next)}
            aria-label={t("language.switchTo")}
            title={t("language.switchTo")}
            {...props}
        >
            <span className="font-bold text-base leading-none">{label}</span>
        </button>
    );
};

export default LanguageToggleButton;

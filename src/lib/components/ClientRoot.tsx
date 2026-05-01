'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useLocale } from '../hooks/useLocale';
import { LOCALE_DIRECTION } from '../i18n';

export function ClientRoot({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    const locale = useLocale()
    const { i18n } = useTranslation()

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const dir = LOCALE_DIRECTION[locale];
        document.documentElement.lang = locale;
        document.documentElement.dir = dir;
        if (i18n.language !== locale) {
            void i18n.changeLanguage(locale);
        }
    }, [locale, i18n]);

    return <>{children}</>;
}

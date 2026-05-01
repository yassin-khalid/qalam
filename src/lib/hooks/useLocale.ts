"use client";
import { useLiveQuery } from "@tanstack/react-db";
import { localStorageCollection } from "../db/localStorageCollection";
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "../i18n";

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function useLocale(): Locale {
  const { data: authSession = [] } = useLiveQuery((q) =>
    q.from({ session: localStorageCollection })
  );
  const stored = authSession[0]?.locale;
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  getMessages,
  getNestedMessage,
  interpolate,
  isLocale,
  LOCALE_LABELS,
  LOCALE_COOKIE_KEY,
  type Locale,
  type MessageObject,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, variables?: Record<string, string | number | null | undefined>) => string;
  getValue: <T>(path: string) => T;
  formatDate: (value: Date | string | number) => string;
  formatTime: (value: Date | string | number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function I18nLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground transition-colors">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-400 dark:border-gray-700 dark:border-t-green-400" />
    </div>
  );
}

function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE_KEY}=`));

  if (!cookie) {
    return null;
  }

  const value = decodeURIComponent(cookie.split("=")[1] ?? "");
  return isLocale(value) ? value : null;
}

function writeLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(locale)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const cookieLocale = readLocaleCookie();
  if (cookieLocale) {
    return cookieLocale;
  }

  const browserLocale = window.navigator.language.split("-")[0];
  if (isLocale(browserLocale)) {
    return browserLocale;
  }

  return DEFAULT_LOCALE;
}

function resolveDocumentTitle(messages: MessageObject): string | null {
  const title = getNestedMessage(messages, "meta.title");
  return typeof title === "string" ? title : null;
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const nextLocale = resolveInitialLocale();
    setLocaleState(nextLocale);
    setIsReady(true);
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeLocaleCookie(locale);
    document.documentElement.lang = locale;

    const nextTitle = resolveDocumentTitle(messages);
    if (nextTitle) {
      document.title = nextTitle;
    }
  }, [isReady, locale, messages]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback<I18nContextValue["t"]>(
    (path, variables) => {
      const value = getNestedMessage(messages, path);

      if (typeof value !== "string") {
        return path;
      }

      return interpolate(value, variables);
    },
    [messages]
  );

  const getValue = useCallback(
    <T,>(path: string) => {
      return getNestedMessage(messages, path) as T;
    },
    [messages]
  );

  const formatDate = useCallback<I18nContextValue["formatDate"]>(
    (value) =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(new Date(value)),
    [locale]
  );

  const formatTime = useCallback<I18nContextValue["formatTime"]>(
    (value) =>
      new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value)),
    [locale]
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      getValue,
      formatDate,
      formatTime,
    }),
    [formatDate, formatTime, getValue, locale, setLocale, t]
  );

  if (!isReady) {
    return <I18nLoadingFallback />;
  }

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider.");
  }

  return context;
}

export { LOCALE_LABELS };

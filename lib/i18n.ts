import enMessages from "@/lib/i18n.en.json";
import ruMessages from "@/lib/i18n.ru.json";
import ptMessages from "@/lib/i18n.pt.json";
import ukMessages from "@/lib/i18n.uk.json";
import deMessages from "@/lib/i18n.de.json";
import frMessages from "@/lib/i18n.fr.json";
import esMessages from "@/lib/i18n.es.json";
import itMessages from "@/lib/i18n.it.json";
import nlMessages from "@/lib/i18n.nl.json";
import plMessages from "@/lib/i18n.pl.json";

export const SUPPORTED_LOCALES = [
  "en",
  "pt",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "ru",
  "uk",
  "pl",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_KEY = "aurora-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  ru: "Русский",
  uk: "Українська",
  pl: "Polski",
};

type MessageValue = string | number | boolean | null | MessageObject | MessageValue[];
export interface MessageObject {
  [key: string]: MessageValue;
}

const localeMessages: Record<Locale, MessageObject> = {
  en: enMessages as MessageObject,
  ru: ruMessages as MessageObject,
  pt: ptMessages as MessageObject,
  uk: ukMessages as MessageObject,
  de: deMessages as MessageObject,
  fr: frMessages as MessageObject,
  es: esMessages as MessageObject,
  it: itMessages as MessageObject,
  nl: nlMessages as MessageObject,
  pl: plMessages as MessageObject,
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && SUPPORTED_LOCALES.includes(value as Locale);
}

function isPlainObject(value: MessageValue | undefined): value is MessageObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base: MessageObject, override: MessageObject): MessageObject {
  const result: MessageObject = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    const baseValue = result[key];

    if (isPlainObject(baseValue) && isPlainObject(value)) {
      result[key] = deepMerge(baseValue, value);
      return;
    }

    result[key] = value;
  });

  return result;
}

export function getMessages(locale: Locale): MessageObject {
  if (locale === DEFAULT_LOCALE) {
    return localeMessages.en;
  }

  return deepMerge(localeMessages.en, localeMessages[locale]);
}

export function getNestedMessage(messages: MessageObject, path: string): MessageValue | undefined {
  return path.split(".").reduce<MessageValue | undefined>((current, segment) => {
    if (!isPlainObject(current) && !Array.isArray(current)) {
      return undefined;
    }

    return (current as MessageObject)[segment];
  }, messages);
}

export function interpolate(
  template: string,
  variables?: Record<string, string | number | null | undefined>
): string {
  if (!variables) {
    return template;
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = variables[key.trim()];
    return value == null ? "" : String(value);
  });
}

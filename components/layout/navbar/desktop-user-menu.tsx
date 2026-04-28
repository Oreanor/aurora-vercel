"use client";

import Link from "next/link";
import { ChevronRight, LogOut, Moon, Sun, UserCircle } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import type { RefObject } from "react";
import { useI18n, LOCALE_LABELS } from "@/components/providers/i18n-provider";
import { useTheme } from "@/components/providers/theme-provider";

interface DesktopUserMenuProps {
  status: "authenticated" | "loading" | "unauthenticated";
  session: Session | null;
  userMenuRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isLanguageSubmenuOpen: boolean;
  setIsLanguageSubmenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isThemeSubmenuOpen: boolean;
  setIsThemeSubmenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export default function DesktopUserMenu({
  status,
  session,
  userMenuRef,
  isOpen,
  setIsOpen,
  isLanguageSubmenuOpen,
  setIsLanguageSubmenuOpen,
  isThemeSubmenuOpen,
  setIsThemeSubmenuOpen,
}: DesktopUserMenuProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();

  const closeAllMenus = () => {
    setIsOpen(false);
    setIsLanguageSubmenuOpen(false);
    setIsThemeSubmenuOpen(false);
  };

  const languageOptions = Object.entries(LOCALE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const themeOptions = [
    { value: "light", label: t("common.lightTheme") },
    { value: "dark", label: t("common.darkTheme") },
  ] as const;
  const currentLanguageLabel = LOCALE_LABELS[locale];
  const currentThemeLabel = theme === "dark" ? t("common.darkTheme") : t("common.lightTheme");

  return (
    <div className="hidden md:flex items-center">
      {status === "loading" ? (
        <div className="h-8 w-8" />
      ) : (
        <>
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setIsOpen((prev) => !prev);
                if (isOpen) {
                  setIsLanguageSubmenuOpen(false);
                  setIsThemeSubmenuOpen(false);
                }
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={t("navbar.userMenu")}
            >
              <UserCircle className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
            {isOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                {session && (
                  <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user?.name || t("common.user")}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {session.user?.email}
                    </p>
                  </div>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLanguageSubmenuOpen((prev) => !prev);
                      setIsThemeSubmenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <span>{t("common.language")}: {currentLanguageLabel}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isLanguageSubmenuOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isLanguageSubmenuOpen && (
                    <div className="absolute top-0 right-full z-50 mr-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                      {languageOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setLocale(option.value as keyof typeof LOCALE_LABELS);
                            closeAllMenus();
                          }}
                          className={`w-full cursor-pointer px-4 py-2 text-left text-sm transition-colors ${
                            locale === option.value
                              ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsThemeSubmenuOpen((prev) => !prev);
                      setIsLanguageSubmenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <span>{t("common.theme")}: {currentThemeLabel}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isThemeSubmenuOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isThemeSubmenuOpen && (
                    <div className="absolute top-0 right-full z-50 mr-2 w-44 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                      {themeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setTheme(option.value);
                            closeAllMenus();
                          }}
                          className={`flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm transition-colors ${
                            theme === option.value
                              ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                          }`}
                        >
                          {option.value === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {session ? (
                  <button
                    onClick={() => {
                      signOut();
                      closeAllMenus();
                    }}
                    className="flex w-full cursor-pointer items-center space-x-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t("common.logOut")}</span>
                  </button>
                ) : (
                  <Link
                    href="/signin"
                    onClick={closeAllMenus}
                    className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    {t("common.signIn")}
                  </Link>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

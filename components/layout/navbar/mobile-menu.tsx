"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { getButtonClasses } from "@/components/ui/button";
import { useI18n, LOCALE_LABELS } from "@/components/providers/i18n-provider";
import { useTheme } from "@/components/providers/theme-provider";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
  pathname: string;
  selectedTreeId: string | null;
  navLinks: NavLink[];
  homeDropdownLinks: NavLink[];
  isHomeDropdownOpen: boolean;
  setIsHomeDropdownOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isMobileLanguageMenuOpen: boolean;
  setIsMobileLanguageMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isMobileThemeMenuOpen: boolean;
  setIsMobileThemeMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export default function MobileMenu({
  session,
  status,
  pathname,
  selectedTreeId,
  navLinks,
  homeDropdownLinks,
  isHomeDropdownOpen,
  setIsHomeDropdownOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isMobileLanguageMenuOpen,
  setIsMobileLanguageMenuOpen,
  isMobileThemeMenuOpen,
  setIsMobileThemeMenuOpen,
}: MobileMenuProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();

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

  const closeMobileMenus = () => {
    setIsMobileMenuOpen(false);
    setIsMobileLanguageMenuOpen(false);
    setIsMobileThemeMenuOpen(false);
  };

  if (!isMobileMenuOpen) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden">
      <div className="space-y-1 px-2 pt-2 pb-3">
        <div>
          <button
            onClick={() => setIsHomeDropdownOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between px-3 py-2 font-medium transition-colors duration-200 ${
              pathname === "/"
                ? "text-green-400"
                : "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            }`}
          >
            <span>{t("navbar.home")}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isHomeDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {isHomeDropdownOpen && (
            <div className="space-y-1 pl-6">
              {homeDropdownLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-sm text-gray-600 transition-colors duration-200 hover:text-green-400 dark:text-gray-300"
                  onClick={() => {
                    setIsHomeDropdownOpen(false);
                    closeMobileMenus();
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {session &&
          navLinks.map((link) => {
            const isActive = pathname === link.href;
            const href = selectedTreeId ? `${link.href}?treeId=${selectedTreeId}` : link.href;
            return (
              <Link
                key={link.href}
                href={href}
                className={`block px-3 py-2 font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-green-400"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                }`}
                onClick={closeMobileMenus}
              >
                {link.label}
              </Link>
            );
          })}

        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          {status === "loading" ? (
            <div className="h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          ) : (
            <div className="space-y-1">
              {session && (
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.user?.name || t("common.user")}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {session.user?.email}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMobileLanguageMenuOpen((prev) => !prev);
                  setIsMobileThemeMenuOpen(false);
                }}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span>{t("common.language")}: {currentLanguageLabel}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileLanguageMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {isMobileLanguageMenuOpen && (
                <div className="pl-3 pb-2">
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setLocale(option.value as keyof typeof LOCALE_LABELS);
                        setIsMobileLanguageMenuOpen(false);
                      }}
                      className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors ${
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
              <button
                type="button"
                onClick={() => {
                  setIsMobileThemeMenuOpen((prev) => !prev);
                  setIsMobileLanguageMenuOpen(false);
                }}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <span>{t("common.theme")}: {currentThemeLabel}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileThemeMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {isMobileThemeMenuOpen && (
                <div className="pl-3 pb-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTheme(option.value);
                        setIsMobileThemeMenuOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
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
              {session ? (
                <button
                  onClick={() => {
                    signOut();
                    closeMobileMenus();
                  }}
                  className="flex w-full cursor-pointer items-center space-x-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("common.logOut")}</span>
                </button>
              ) : (
                <Link
                  href="/signin"
                  className={getButtonClasses("primary", "sm", "mx-3 mt-2 flex justify-center")}
                  onClick={closeMobileMenus}
                >
                  {t("common.signIn")}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

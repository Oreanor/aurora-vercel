"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Button, { getButtonClasses } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useI18n } from "@/components/providers/i18n-provider";

export default function ChatDemo() {
  const { data: session } = useSession();
  const { t } = useI18n();
  
  return (
      <>
        {/* Chat Window */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/95 md:rounded-2xl">
          {/* Chat Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-2.5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800 md:px-6 md:py-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-base md:text-xl font-semibold">M</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white md:text-base">{t("chatDemo.name")}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 md:text-sm">{t("chatDemo.years")} • <span className="font-medium text-green-600 dark:text-green-400">{t("common.activeNow")}</span></p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 p-3 md:space-y-4 md:p-4">
            {/* Grandmother's Message */}
            <div className="flex space-x-1.5 md:space-x-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] md:text-xs font-semibold">M</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-gray-100 px-2.5 py-1.5 dark:bg-slate-800 md:max-w-sm md:rounded-xl md:px-3 md:py-2">
                  <p className="text-xs text-gray-800 dark:text-gray-100 md:text-sm">
                    {t("chatDemo.message1")}
                  </p>
                </div>
                <p className="ml-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 md:ml-3 md:mt-1 md:text-xs">{t("chatDemo.time1")}</p>
              </div>
            </div>

            {/* User's Message */}
            <div className="flex space-x-1.5 md:space-x-2 justify-end">
              <div className="flex-1 flex justify-end min-w-0">
                <div className="max-w-[85%] md:max-w-sm">
                  <div className="bg-blue-500 text-white rounded-lg md:rounded-xl rounded-tr-sm px-2.5 py-1.5 md:px-3 md:py-2">
                    <p className="text-xs md:text-sm">
                      {t("chatDemo.message2")}
                    </p>
                  </div>
                  <p className="mt-0.5 text-right text-[10px] text-gray-500 dark:text-gray-400 md:mt-1 md:text-xs">{t("common.you")} • {t("chatDemo.time2")}</p>
                </div>
              </div>
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">Y</span>
              </div>
            </div>

            {/* Grandmother's Response */}
            <div className="flex space-x-1.5 md:space-x-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] md:text-xs font-semibold">M</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-gray-100 px-2.5 py-1.5 dark:bg-slate-800 md:max-w-sm md:rounded-xl md:px-3 md:py-2">
                  <p className="text-xs text-gray-800 dark:text-gray-100 md:text-sm">
                    {t("chatDemo.message3")}
                  </p>
                </div>
                <p className="ml-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 md:ml-3 md:mt-1 md:text-xs">{t("chatDemo.time3")}</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 dark:border-slate-800 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="min-w-0 flex-1 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-slate-800 md:px-4 md:py-2">
                <Input
                  type="text"
                  placeholder={t("chatDemo.placeholder")}
                  className="rounded-full border-0 bg-transparent placeholder-gray-500 shadow-none focus:ring-0 dark:placeholder-gray-400"
                  disabled
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                className="rounded-full flex-shrink-0"
                disabled
              >
                {t("common.send")}
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Below Chat */}
        <div className="text-center mt-4 md:mt-8">
          <Link
            href={session ? "/chatroom" : "/signin"}
            className={getButtonClasses(
              "primary",
              "lg",
              "inline-block rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-300"
            )}
          >
            {t("chatDemo.cta")}
          </Link>
        </div>
      </>
  );
}

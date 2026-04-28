"use client";

import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import Button from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

export interface CallSessionCardProps {
  readonly headline: string;
  readonly subline: string;
  /** Middle section: avatar / waveform / video placeholder */
  readonly children: ReactNode;
  readonly startButtonLabel: string;
  readonly StartIcon: LucideIcon;
  readonly isStarting: boolean;
  readonly onStart: () => void;
  readonly sessionMessage: string | null;
  readonly secondaryLinks: readonly { href: string; label: string }[];
  readonly emptyIcon: LucideIcon;
  readonly emptyMessage: string;
  readonly hasSelection: boolean;
  /** Optional chat section for voice/video: type messages instead of speaking */
  readonly chatSection?: ReactNode;
}

/**
 * Shared card layout for Voice and Video call pages: gradient header, avatar slot, start CTA, session message.
 */
export default function CallSessionCard({
  headline,
  subline,
  children,
  startButtonLabel,
  StartIcon,
  isStarting,
  onStart,
  sessionMessage,
  secondaryLinks,
  emptyIcon: EmptyIcon,
  emptyMessage,
  hasSelection,
  chatSection,
}: CallSessionCardProps) {
  const { t } = useI18n();

  return (
    <div className="mt-4 md:mt-8 max-w-2xl">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 md:rounded-2xl">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-4 text-center dark:border-gray-800 dark:from-slate-900 dark:to-slate-800 md:px-6 md:py-8">
          <p className="text-base font-medium text-gray-700 dark:text-gray-200 md:text-lg">{headline}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:mt-2 md:text-sm">{subline}</p>
        </div>

        {hasSelection ? (
          <>
            <div className="flex flex-col items-center py-6 px-4 md:py-10 md:px-6">
              {children}
            </div>

            <div className="flex flex-col items-center justify-center gap-3 border-t border-gray-200 p-4 dark:border-gray-800 sm:flex-row md:gap-4 md:p-6">
              <Button
                onClick={onStart}
                disabled={isStarting}
                variant="primary"
                size="sm"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isStarting ? (
                  <>
                    <StartIcon className="h-5 w-5 animate-pulse" />
                    {t("common.connecting")}
                  </>
                ) : (
                  <>
                    <StartIcon className="h-5 w-5" />
                    {startButtonLabel}
                  </>
                )}
              </Button>
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm">
                {secondaryLinks.map(({ href, label }) => (
                  <a
                    key={`${href}-${label}`}
                    href={href}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {sessionMessage && (
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <p className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300 md:px-3 md:py-2 md:text-sm">
                  {sessionMessage}
                </p>
              </div>
            )}

            {chatSection}
          </>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 md:px-6 md:py-12">
            <EmptyIcon className="mx-auto mb-2 h-10 w-10 text-gray-300 dark:text-gray-600 md:mb-3 md:h-12 md:w-12" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

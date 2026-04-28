"use client";

import { useI18n } from '@/components/providers/i18n-provider';

interface Props {
  className?: string;
}

export default function Footer({ className = "" }: Props) {
  const { t } = useI18n();

  return (
    <footer className={`bg-gray-900 py-8 text-white transition-colors dark:bg-black ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

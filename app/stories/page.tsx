"use client";

import { useI18n } from '@/components/providers/i18n-provider';

export default function StoriesPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("storiesPage.title")}</h1>
        <p className="mt-4 text-gray-600">{t("storiesPage.description")}</p>
      </div>
    </div>
  );
}

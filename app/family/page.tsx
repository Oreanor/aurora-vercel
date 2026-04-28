"use client";

import { useI18n } from '@/components/providers/i18n-provider';

export default function FamilyPage() {
  const { t } = useI18n();

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("familyPage.title")}</h1>
        <p className="mt-4 text-gray-600">{t("familyPage.description")}</p>
      </div>
    </div>
  );
}

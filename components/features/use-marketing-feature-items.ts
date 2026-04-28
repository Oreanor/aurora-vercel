"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { FeatureCardItem, FeatureStatusKey } from "./feature-card";

interface RawFeatureItem {
  icon: string;
  status: string;
  title: string;
  description: string;
  features: string[];
  iconBgColor: string;
}

const defaultStatusMap: Record<FeatureStatusKey, string> = {
  available: "Available",
  newFeature: "New Feature",
  alwaysOn: "Always On",
  q42025: "Q4 2025",
};

export function useMarketingFeatureItems(path: string): FeatureCardItem[] {
  const { getValue } = useI18n();
  const rawItems = getValue<RawFeatureItem[]>(path);
  const statusMap = getValue<Record<FeatureStatusKey, string>>("marketing.featureStatuses");

  return useMemo(() => {
    const entries = Object.entries(statusMap ?? defaultStatusMap) as Array<[FeatureStatusKey, string]>;

    return rawItems.map((item) => {
      const statusKey =
        entries.find(([, label]) => label === item.status)?.[0] ??
        (Object.entries(defaultStatusMap).find(([, label]) => label === item.status)?.[0] as FeatureStatusKey | undefined) ??
        "alwaysOn";

      return {
        icon: item.icon,
        statusKey,
        statusLabel: item.status,
        title: item.title,
        description: item.description,
        features: item.features,
        iconBgColor: item.iconBgColor,
      };
    });
  }, [rawItems, statusMap]);
}

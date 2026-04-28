import MarketingFeatureGrid from "./marketing-feature-grid";
import { useMarketingFeatureItems } from "./use-marketing-feature-items";

interface Props {
  className?: string;
}

export default function FeaturesPreview({ className = "" }: Props) {
  const features = useMarketingFeatureItems("marketing.features.items");

  return (
    <MarketingFeatureGrid
      className={className}
      containerClassName="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      gridClassName="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      items={features}
    />
  );
}

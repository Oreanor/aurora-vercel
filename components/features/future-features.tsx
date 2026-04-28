import MarketingFeatureGrid from "./marketing-feature-grid";
import { useMarketingFeatureItems } from "./use-marketing-feature-items";

interface Props {
  className?: string;
}

export default function FutureFeatures({ className = "" }: Props) {
  const futureFeatures = useMarketingFeatureItems("marketing.future.items");

  return (
    <MarketingFeatureGrid
      className={className}
      containerClassName="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8"
      gridClassName="grid gap-8 md:grid-cols-3"
      items={futureFeatures}
    />
  );
}

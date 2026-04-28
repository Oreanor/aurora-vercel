import FeatureCard, { type FeatureCardItem } from "./feature-card";

interface MarketingFeatureGridProps {
  className?: string;
  containerClassName: string;
  gridClassName: string;
  items: FeatureCardItem[];
}

export default function MarketingFeatureGrid({
  className = "",
  containerClassName,
  gridClassName,
  items,
}: MarketingFeatureGridProps) {
  return (
    <div className={`bg-white/30 backdrop-blur-sm dark:bg-slate-950/60 ${className}`}>
      <div className={containerClassName}>
        <div className={gridClassName}>
          {items.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}

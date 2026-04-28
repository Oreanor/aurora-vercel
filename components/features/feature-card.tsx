"use client";

export type FeatureStatusKey = "available" | "newFeature" | "alwaysOn" | "q42025";

export interface FeatureCardItem {
  icon: string;
  statusKey: FeatureStatusKey;
  statusLabel: string;
  title: string;
  description: string;
  features: string[];
  iconBgColor: string;
}

export default function FeatureCard({ 
  icon, 
  statusKey,
  statusLabel,
  title, 
  description, 
  features, 
  iconBgColor 
}: FeatureCardItem) {
  const statusStyles: Record<FeatureStatusKey, string> = {
    available: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300",
    newFeature: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
    alwaysOn: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300",
    q42025: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  };

  return (
    <div className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20">
      {/* Status Badge - Top Right */}
      <div className="absolute top-4 right-4">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusStyles[statusKey]}`}>
          {statusLabel}
        </span>
      </div>
      
      {/* Icon */}
      <div className={`w-16 h-16 mb-4 rounded-full ${iconBgColor} flex items-center justify-center`}>
        <span className="text-2xl">{icon}</span>
      </div>
      
      {/* Content */}
      <div className="text-left">
        <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
        <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          {features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

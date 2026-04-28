interface Props {
  stepNumber: number;
  title: string;
  description: string;
  features: string[];
  className?: string;
}

export default function StepCard({ 
  stepNumber, 
  title, 
  description, 
  features, 
  className = "" 
}: Props) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20 ${className}`}>
      {/* Step Number */}
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-green-400 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
          {stepNumber}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
      
      {/* Features List */}
      <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        {features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
    </div>
  );
}

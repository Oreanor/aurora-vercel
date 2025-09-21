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
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Step Number */}
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-green-400 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
          {stepNumber}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
      
      {/* Features List */}
      <ul className="text-xs text-gray-500 space-y-1">
        {features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
    </div>
  );
}

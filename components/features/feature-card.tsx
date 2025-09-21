interface Props {
  icon: string;
  status: "Available" | "New Feature" | "Always On" | "Q4 2025";
  title: string;
  description: string;
  features: string[];
  iconBgColor: string;
}

export default function FeatureCard({ 
  icon, 
  status, 
  title, 
  description, 
  features, 
  iconBgColor 
}: Props) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Available":
        return "text-green-600 bg-green-100";
      case "New Feature":
        return "text-blue-600 bg-blue-100";
      case "Always On":
        return "text-gray-600 bg-gray-100";
      case "Q4 2025":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      {/* Status Badge - Top Right */}
      <div className="absolute top-4 right-4">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(status)}`}>
          {status}
        </span>
      </div>
      
      {/* Icon */}
      <div className={`w-16 h-16 mb-4 rounded-full ${iconBgColor} flex items-center justify-center`}>
        <span className="text-2xl">{icon}</span>
      </div>
      
      {/* Content */}
      <div className="text-left">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{description}</p>
        <ul className="text-xs text-gray-500 space-y-1">
          {features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

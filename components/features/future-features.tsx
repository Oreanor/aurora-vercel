import FeatureCard from "./feature-card";

interface Props {
  className?: string;
}

export default function FutureFeatures({ className = "" }: Props) {
  const futureFeatures = [
    {
      icon: "🎥",
      status: "Q4 2025" as const,
      title: "AI Video Conversations",
      description: "Watch your ancestors come to life with AI-generated video responses. See their facial expressions and gestures as they share their stories.",
      features: [
        "Lifelike video generation",
        "Emotion-aware responses",
        "Historical period accuracy"
      ],
      iconBgColor: "bg-red-100"
    },
    {
      icon: "🎤",
      status: "Q4 2025" as const,
      title: "Voice Replication",
      description: "Hear your ancestors speak in their authentic voices. Upload audio samples to create personalized voice models for each ancestor.",
      features: [
        "Custom voice cloning",
        "Accent preservation",
        "Emotional tone matching"
      ],
      iconBgColor: "bg-purple-100"
    },
    {
      icon: "🌳",
      status: "Q4 2025" as const,
      title: "Interactive Family Tree",
      description: "Explore your family history through an immersive, interactive tree. Click on any ancestor to instantly start a conversation.",
      features: [
        "Visual family navigation",
        "Timeline integration",
        "Relationship mapping"
      ],
      iconBgColor: "bg-green-100"
    }
  ];

  return (
    <div className={`bg-white/30 backdrop-blur-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {futureFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              status={feature.status}
              title={feature.title}
              description={feature.description}
              features={feature.features}
              iconBgColor={feature.iconBgColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

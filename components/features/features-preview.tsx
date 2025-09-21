import FeatureCard from "./feature-card";

interface Props {
  className?: string;
}

export default function FeaturesPreview({ className = "" }: Props) {
  const features = [
    {
      icon: "💬",
      status: "Available" as const,
      title: "Heartwarming Conversations",
      description: "Chat with your beloved family members as if they were sitting right next to you by the fireplace. Our AI lovingly captures their unique voice, personality, and wisdom.",
      features: [
        "Natural conversation flow",
        "Personalized responses based on their life",
        "Voice synthesis coming soon"
      ],
      iconBgColor: "bg-blue-100"
    },
    {
      icon: "🧠",
      status: "Available" as const,
      title: "AI Personality Training",
      description: "Build detailed personality profiles by sharing stories, photos, and memories. The more you share, the more realistic conversations become.",
      features: [
        "Story collection system",
        "Personality trait mapping",
        "Memory integration"
      ],
      iconBgColor: "bg-purple-100"
    },
    {
      icon: "🎬",
      status: "New Feature" as const,
      title: "My Story Visual Narratives",
      description: "Transform your life stories into cinematic visual experiences. AI creates beautiful cartoon-style scenes with narration from your memories.",
      features: [
        "AI story enhancement",
        "Scene-by-scene generation",
        "Video compilation with narration"
      ],
      iconBgColor: "bg-orange-100"
    },
    {
      icon: "⏰",
      status: "New Feature" as const,
      title: "Time Vault Messages",
      description: "Record video messages for the future. Leave wisdom for children not yet born or messages to be opened on special dates.",
      features: [
        "Video message storage",
        "Time-locked delivery",
        "Future surprise planning"
      ],
      iconBgColor: "bg-yellow-100"
    },
    {
      icon: "💾",
      status: "New Feature" as const,
      title: "Memory Vault Storage",
      description: "Preserve your family memories forever. Store audio recordings, photos, videos, and written stories in your secure digital vault.",
      features: [
        "Audio & video storage",
        "Photo collections",
        "Written memories & documents"
      ],
      iconBgColor: "bg-green-100"
    },
    {
      icon: "🔐",
      status: "Always On" as const,
      title: "Private & Secure",
      description: "Your family memories are precious. We protect them with bank-level security and give you complete control over your data.",
      features: [
        "End-to-end encryption",
        "Private family conversations",
        "You own your data"
      ],
      iconBgColor: "bg-red-100"
    }
  ];

  return (
    <div className={`bg-white/30 backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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

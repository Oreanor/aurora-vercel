import StepCard from "./step-card";

interface Props {
  className?: string;
}

export default function HowToSteps({ className = "" }: Props) {
  const steps = [
    {
      stepNumber: 1,
      title: "Share Their Beautiful Story",
      description: "Tell us about your beloved family member - their warm personality, favorite sayings, life experiences, and the precious stories you remember. Even small details help create a more heartfelt conversation experience.",
      features: [
        "Share memories and family stories",
        "Describe their personality and quirks",
        "Add photos and personal details"
      ]
    },
    {
      stepNumber: 2,
      title: "AI Learns with Love",
      description: "Our caring AI studies everything you've shared to understand your family member's unique personality, speech patterns, and worldview. It lovingly learns how they might respond to different topics and questions.",
      features: [
        "AI personality modeling",
        "Speech pattern recognition",
        "Historical context integration"
      ]
    },
    {
      stepNumber: 3,
      title: "Start Your Chats!",
      description: "Once your family member's AI companion is ready, you can start having warm conversations! Ask them about their life, seek gentle advice, or simply enjoy a cozy chat. Each conversation helps the AI learn and become even more loving.",
      features: [
        "Natural conversation interface",
        "Ask questions about their past",
        "Get wisdom and family advice"
      ]
    }
  ];

  return (
    <div className={`bg-white/30 backdrop-blur-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              features={step.features}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

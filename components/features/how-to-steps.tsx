import StepCard from "./step-card";
import { useI18n } from "@/components/providers/i18n-provider";

interface Props {
  className?: string;
}

export default function HowToSteps({ className = "" }: Props) {
  const { getValue } = useI18n();
  const steps = getValue<Array<{
    stepNumber: number;
    title: string;
    description: string;
    features: string[];
  }>>("marketing.howTo.items");

  return (
    <div className={`bg-white/30 backdrop-blur-sm dark:bg-slate-950/60 ${className}`}>
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

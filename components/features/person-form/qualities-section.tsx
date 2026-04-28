"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import type { IQualities } from "@/types/family";

interface QualitiesSectionProps {
  title: string;
  showLabel: string;
  hideLabel: string;
  showQualities: boolean;
  qualities: IQualities;
  onToggle: () => void;
  onChange: (field: keyof IQualities, value: string | number) => void;
  labels: Record<keyof IQualities, string>;
}

export default function QualitiesSection({
  title,
  showLabel,
  hideLabel,
  showQualities,
  qualities,
  onToggle,
  onChange,
  labels,
}: QualitiesSectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-green-400 hover:text-green-600"
        >
          {showQualities ? hideLabel : showLabel}
        </Button>
      </div>

      {showQualities && (
        <div className="space-y-4">
          <Input
            label={labels.openness}
            type="number"
            min="0"
            max="100"
            value={qualities.openness}
            onChange={(event) => onChange("openness", parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label={labels.conscientiousness}
            type="number"
            min="0"
            max="100"
            value={qualities.conscientiousness}
            onChange={(event) => onChange("conscientiousness", parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label={labels.extraversion}
            type="number"
            min="0"
            max="100"
            value={qualities.extraversion}
            onChange={(event) => onChange("extraversion", parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label={labels.agreeableness}
            type="number"
            min="0"
            max="100"
            value={qualities.agreeableness}
            onChange={(event) => onChange("agreeableness", parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label={labels.neuroticism}
            type="number"
            min="0"
            max="100"
            value={qualities.neuroticism}
            onChange={(event) => onChange("neuroticism", parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label={labels.formality}
            type="number"
            min="0"
            max="100"
            value={qualities.formality}
            onChange={(event) => onChange("formality", parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label={labels.religion}
            type="text"
            value={qualities.religion}
            onChange={(event) => onChange("religion", event.target.value)}
          />
          <Input
            label={labels.religionScale}
            type="number"
            min="0"
            max="100"
            value={qualities.religionScale}
            onChange={(event) => onChange("religionScale", parseInt(event.target.value, 10) || 0)}
          />
          <Input
            label={labels.passions}
            type="text"
            value={qualities.passions}
            onChange={(event) => onChange("passions", event.target.value)}
          />
          <Input
            label={labels.senseOfHumor}
            type="text"
            value={qualities.senseOfHumor}
            onChange={(event) => onChange("senseOfHumor", event.target.value)}
          />
          <Input
            label={labels.positivity}
            type="number"
            min="0"
            max="100"
            value={qualities.positivity}
            onChange={(event) => onChange("positivity", parseInt(event.target.value, 10) || 0)}
          />
        </div>
      )}
    </div>
  );
}

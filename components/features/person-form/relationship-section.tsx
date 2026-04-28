"use client";

import PersonAutocomplete from "@/components/ui/person-autocomplete";
import Select from "@/components/ui/select";
import type { Person } from "@/types/family";

interface RelationshipSectionProps {
  title: string;
  relationshipLabel: string;
  relatedPersonLabel: string;
  relationshipRole: "father" | "mother" | "son" | "daughter" | "spouse" | "";
  relatedPersonId: string;
  relationshipError?: string;
  persons: Person[];
  selectPlaceholder: string;
  relationshipOptions: Array<{ value: string; label: string }>;
  searchPlaceholder: string;
  relationshipFirstPlaceholder: string;
  onRelationshipRoleChange: (value: "father" | "mother" | "son" | "daughter" | "spouse" | "") => void;
  onRelatedPersonChange: (personId: string) => void;
}

export default function RelationshipSection({
  title,
  relationshipLabel,
  relatedPersonLabel,
  relationshipRole,
  relatedPersonId,
  relationshipError,
  persons,
  selectPlaceholder,
  relationshipOptions,
  searchPlaceholder,
  relationshipFirstPlaceholder,
  onRelationshipRoleChange,
  onRelatedPersonChange,
}: RelationshipSectionProps) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={relationshipLabel}
            value={relationshipRole}
            onChange={(event) =>
              onRelationshipRoleChange(
                event.target.value as "father" | "mother" | "son" | "daughter" | "spouse" | ""
              )
            }
            required
            options={[{ value: "", label: selectPlaceholder }, ...relationshipOptions]}
          />
          <PersonAutocomplete
            label={relatedPersonLabel}
            persons={persons}
            value={relatedPersonId}
            onChange={onRelatedPersonChange}
            placeholder={relationshipRole ? searchPlaceholder : relationshipFirstPlaceholder}
            required
          />
        </div>
        {relationshipError && <p className="mt-2 text-sm text-red-600">{relationshipError}</p>}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  formatDateForInput,
  hasUnsavedPersonChanges,
  validateChildRelationship,
  validateParentRelationship,
} from "@/lib/utils";
import type { AddPersonPanelRef } from "@/components/features/add-person-panel";
import type { Gender, IQualities, Person, Relationship, SpouseLink } from "@/types/family";

interface UseAddPersonFormOptions {
  ref: React.ForwardedRef<AddPersonPanelRef>;
  onClose: () => void;
  onSave: (
    person: Omit<Person, "id">,
    relationship?: { type: "parent" | "child" | "spouse"; relatedPersonId: string }
  ) => void;
  onUpdate?: (personId: string, person: Omit<Person, "id">) => void;
  persons: Person[];
  relationships: Relationship[];
  spouseLinks: SpouseLink[];
  mainPersonId?: string;
  personToEdit?: Person;
}

const defaultQualities: IQualities = {
  openness: 0,
  conscientiousness: 0,
  extraversion: 0,
  agreeableness: 0,
  neuroticism: 0,
  formality: 0,
  religion: "",
  religionScale: 0,
  passions: "",
  senseOfHumor: "",
  positivity: 0,
};

const emptyFormData: Omit<Person, "id"> = {
  firstName: "",
  lastName: "",
  middleName: "",
  birthDate: "",
  deathDate: "",
  gender: undefined,
  photo: "",
  biography: "",
  hobbies: "",
  qualities: undefined,
};

export function useAddPersonForm({
  ref,
  onClose,
  onSave,
  onUpdate,
  persons,
  relationships,
  spouseLinks,
  mainPersonId,
  personToEdit,
}: UseAddPersonFormOptions) {
  const { t } = useI18n();
  const isEditMode = !!personToEdit;

  const [formData, setFormData] = useState<Omit<Person, "id">>(() => {
    if (!personToEdit) {
      return emptyFormData;
    }

    return {
      firstName: personToEdit.firstName || "",
      lastName: personToEdit.lastName || "",
      middleName: personToEdit.middleName || "",
      birthDate: formatDateForInput(personToEdit.birthDate),
      deathDate: formatDateForInput(personToEdit.deathDate),
      gender: personToEdit.gender,
      photo: personToEdit.photo || "",
      biography: personToEdit.biography || "",
      hobbies: personToEdit.hobbies || "",
      qualities: personToEdit.qualities,
    };
  });

  const [relationshipType, setRelationshipType] = useState<"parent" | "child" | "spouse" | "">(
    persons.length > 0 && !isEditMode ? "parent" : ""
  );
  const [relationshipRole, setRelationshipRole] = useState<
    "father" | "mother" | "son" | "daughter" | "spouse" | ""
  >(() => {
    if (isEditMode && personToEdit?.gender) {
      return personToEdit.gender === "male"
        ? "father"
        : personToEdit.gender === "female"
          ? "mother"
          : "";
    }
    return "";
  });
  const [parentGender, setParentGender] = useState<"male" | "female" | "">(() => {
    if (isEditMode && personToEdit?.gender) {
      return personToEdit.gender === "male"
        ? "male"
        : personToEdit.gender === "female"
          ? "female"
          : "";
    }
    return "";
  });
  const [relatedPersonId, setRelatedPersonId] = useState("");
  const [relationshipError, setRelationshipError] = useState("");
  const [showQualities, setShowQualities] = useState(Boolean(personToEdit?.qualities));
  const [qualities, setQualities] = useState<IQualities>(personToEdit?.qualities ?? defaultQualities);
  const formRef = useRef<HTMLFormElement>(null);

  const hasUnsavedChanges = useCallback(() => {
    if (isEditMode && personToEdit) {
      return hasUnsavedPersonChanges(formData, personToEdit, parentGender, qualities, showQualities);
    }
    return false;
  }, [formData, isEditMode, parentGender, personToEdit, qualities, showQualities]);

  useImperativeHandle(
    ref,
    () => ({
      hasUnsavedChanges,
    }),
    [hasUnsavedChanges]
  );

  const validateRelationship = useCallback(() => {
    void spouseLinks;

    if (persons.length > 0) {
      if (!relationshipType || !relatedPersonId) {
        setRelationshipError(t("personForm.validation.selectRelationshipAndPerson"));
        return false;
      }
    } else if (!relationshipType || !relatedPersonId) {
      setRelationshipError("");
      return true;
    }

    if ((relationshipType === "parent" || relationshipType === "child") && (!relationshipRole || !parentGender)) {
      setRelationshipError("");
      return true;
    }

    if (relationshipType === "parent") {
      const validation = validateParentRelationship(
        relatedPersonId,
        relationships || []
      );

      if (!validation.isValid) {
        setRelationshipError(
          validation.errorKey ? t(validation.errorKey, validation.errorValues) : validation.error || ""
        );
        return false;
      }

      setRelationshipError("");
      return true;
    }

    if (relationshipType === "child") {
      const validation = validateChildRelationship(relatedPersonId, mainPersonId, persons);

      if (!validation.isValid) {
        setRelationshipError(
          validation.errorKey ? t(validation.errorKey, validation.errorValues) : validation.error || ""
        );
        return false;
      }

      setRelationshipError("");
      return true;
    }

    if (relationshipType === "spouse") {
      if (!relatedPersonId || !persons.find((person) => person.id === relatedPersonId)) {
        setRelationshipError(t("personForm.validation.selectPerson"));
        return false;
      }

      setRelationshipError("");
      return true;
    }

    setRelationshipError("");
    return true;
  }, [
    mainPersonId,
    parentGender,
    persons,
    relationships,
    relatedPersonId,
    relationshipRole,
    relationshipType,
    spouseLinks,
    t,
  ]);

  useEffect(() => {
    validateRelationship();
  }, [validateRelationship]);

  const handleChange = (field: keyof Omit<Person, "id" | "qualities">, value: string | Gender | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQualitiesChange = (field: keyof IQualities, value: string | number) => {
    setQualities((prev) => ({ ...prev, [field]: value }));
  };

  const handleRelationshipRoleChange = (value: "father" | "mother" | "son" | "daughter" | "spouse" | "") => {
    let nextGender: "male" | "female" | "" = "";
    let nextRelationshipType: "parent" | "child" | "spouse" | "" = "";

    if (value === "father") {
      nextGender = "male";
      nextRelationshipType = "parent";
    } else if (value === "mother") {
      nextGender = "female";
      nextRelationshipType = "parent";
    } else if (value === "son") {
      nextGender = "male";
      nextRelationshipType = "child";
    } else if (value === "daughter") {
      nextGender = "female";
      nextRelationshipType = "child";
    } else if (value === "spouse") {
      nextRelationshipType = "spouse";
    }

    setRelationshipRole(value);
    setParentGender(nextGender);
    setRelationshipType(nextRelationshipType);

    if (value !== "spouse") {
      handleChange("gender", nextGender || undefined);
    }

    if (relationshipError) {
      setRelationshipError("");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isEditMode) {
      if (!personToEdit) return;

      const personData: Omit<Person, "id"> = {
        ...formData,
        gender: parentGender || formData.gender,
        qualities: showQualities ? qualities : undefined,
      };

      onUpdate?.(personToEdit.id, personData);
      onClose();
      return;
    }

    if (persons.length > 0) {
      if (!relationshipType || !relatedPersonId) {
        setRelationshipError(t("personForm.validation.selectRelationshipTypeAndPerson"));
        return;
      }
      if (relationshipType !== "spouse" && !parentGender) {
        setRelationshipError(t("personForm.validation.selectRelationshipType"));
        return;
      }
    }

    if (!validateRelationship()) {
      return;
    }

    if (persons.length > 0 && (!relationshipType || !relatedPersonId)) {
      setRelationshipError(t("personForm.validation.selectRelationshipAndPerson"));
      return;
    }

    const personData: Omit<Person, "id"> = {
      ...formData,
      gender: relationshipType === "spouse" ? formData.gender : parentGender || formData.gender,
      qualities: showQualities ? qualities : undefined,
    };

    const relationship =
      relationshipType && relatedPersonId
        ? { type: relationshipType as "parent" | "child" | "spouse", relatedPersonId }
        : undefined;

    onSave(personData, relationship);
    onClose();
  };

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return {
    isEditMode,
    formData,
    relationshipRole,
    relatedPersonId,
    relationshipError,
    showQualities,
    qualities,
    formRef,
    setRelatedPersonId,
    setShowQualities,
    handleChange,
    handleQualitiesChange,
    handleRelationshipRoleChange,
    handleSubmit,
    handleFormSubmit,
  };
}

'use client';

import React from 'react';
import { Person, Relationship, SpouseLink } from '@/types/family';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { formatDateForInput } from '@/lib/utils';
import { useI18n } from '@/components/providers/i18n-provider';
import { useAddPersonForm } from '@/components/features/person-form/use-add-person-form';
import RelationshipSection from '@/components/features/person-form/relationship-section';
import QualitiesSection from '@/components/features/person-form/qualities-section';

export interface AddPersonPanelRef {
  hasUnsavedChanges: () => boolean;
}

interface AddPersonPanelProps {
  onClose: () => void;
  onSave: (person: Omit<Person, 'id'>, relationship?: { type: 'parent' | 'child' | 'spouse'; relatedPersonId: string }) => void;
  persons?: Person[];
  relationships?: Relationship[];
  spouseLinks?: SpouseLink[];
  mainPersonId?: string;
  personToEdit?: Person;
  onUpdate?: (personId: string, person: Omit<Person, 'id'>) => void;
}

const AddPersonPanel = React.forwardRef<AddPersonPanelRef, AddPersonPanelProps>(({
  onClose,
  onSave,
  persons = [],
  relationships = [],
  spouseLinks = [],
  mainPersonId,
  personToEdit,
  onUpdate,
}, ref) => {
  const { t } = useI18n();
  const {
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
  } = useAddPersonForm({
    ref,
    onClose,
    onSave,
    onUpdate,
    persons,
    relationships,
    spouseLinks,
    mainPersonId,
    personToEdit,
  });

  return (
    <div
      className="absolute right-0 top-0 z-40 flex h-full w-[min(50%,500px)] flex-col border-l border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? t("personForm.editPerson") : t("personForm.addNewPerson")}
        </h2>
        <button
          onClick={onClose}
          className="cursor-pointer text-2xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label={t("common.close")}
        >
          ×
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {persons.length > 0 && !isEditMode && (
            <RelationshipSection
              title={t("personForm.relationship")}
              relationshipLabel={t("personForm.relationshipIs")}
              relatedPersonLabel={t("personForm.relationshipOf")}
              relationshipRole={relationshipRole}
              relatedPersonId={relatedPersonId}
              relationshipError={relationshipError}
              persons={persons}
              selectPlaceholder={t("common.select")}
              relationshipOptions={[
                { value: 'father', label: t("personForm.relationshipOptions.father") },
                { value: 'mother', label: t("personForm.relationshipOptions.mother") },
                { value: 'son', label: t("personForm.relationshipOptions.son") },
                { value: 'daughter', label: t("personForm.relationshipOptions.daughter") },
                { value: 'spouse', label: t("personForm.relationshipOptions.spouse") },
              ]}
              searchPlaceholder={t("common.searchPerson")}
              relationshipFirstPlaceholder={t("personForm.selectRelationshipFirst")}
              onRelationshipRoleChange={handleRelationshipRoleChange}
              onRelatedPersonChange={setRelatedPersonId}
            />
          )}

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t("personForm.basicInformation")}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("personForm.firstName")}
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(event) => handleChange('firstName', event.target.value)}
                />
                <Input
                  label={t("personForm.lastName")}
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(event) => handleChange('lastName', event.target.value)}
                />
              </div>

              <Input
                label={t("personForm.middleName")}
                type="text"
                value={formData.middleName || ''}
                onChange={(event) => handleChange('middleName', event.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("personForm.dateOfBirth")}
                  type="date"
                  value={formatDateForInput(formData.birthDate)}
                  onChange={(event) => handleChange('birthDate', event.target.value)}
                />
                <Input
                  label={t("personForm.dateOfDeath")}
                  type="date"
                  value={formatDateForInput(formData.deathDate)}
                  onChange={(event) => handleChange('deathDate', event.target.value)}
                />
              </div>

              <Input
                label={t("personForm.photoUrl")}
                type="url"
                value={formData.photo || ''}
                onChange={(event) => handleChange('photo', event.target.value)}
                placeholder={t("personForm.photoUrlPlaceholder")}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t("personForm.biography")}</h3>
            <Textarea
              label=""
              value={formData.biography || ''}
              onChange={(event) => handleChange('biography', event.target.value)}
              placeholder={t("personForm.biographyPlaceholder")}
              rows={4}
            />
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t("personForm.hobbies")}</h3>
            <Textarea
              label=""
              value={formData.hobbies || ''}
              onChange={(event) => handleChange('hobbies', event.target.value)}
              placeholder={t("personForm.hobbiesPlaceholder")}
              rows={3}
            />
          </div>

          <QualitiesSection
            title={t("personForm.qualities")}
            showLabel={t("common.show")}
            hideLabel={t("common.hide")}
            showQualities={showQualities}
            qualities={qualities}
            onToggle={() => setShowQualities((prev) => !prev)}
            onChange={handleQualitiesChange}
            labels={{
              openness: t("personForm.openness"),
              conscientiousness: t("personForm.conscientiousness"),
              extraversion: t("personForm.extraversion"),
              agreeableness: t("personForm.agreeableness"),
              neuroticism: t("personForm.neuroticism"),
              formality: t("personForm.formality"),
              religion: t("personForm.religion"),
              religionScale: t("personForm.religiosity"),
              passions: t("personForm.passions"),
              senseOfHumor: t("personForm.senseOfHumor"),
              positivity: t("personForm.positivity"),
            }}
          />
        </div>
      </form>

      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleFormSubmit}
            className="flex-1"
          >
            {isEditMode ? t("common.saveChanges") : t("common.addPerson")}
          </Button>
        </div>
      </div>
    </div>
  );
});

AddPersonPanel.displayName = 'AddPersonPanel';

export default AddPersonPanel;


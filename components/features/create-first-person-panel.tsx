'use client';

import { useState, useRef } from 'react';
import { Person, Gender, IQualities } from '@/types/family';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import { formatDateForInput } from '@/lib/utils';
import { useI18n } from '@/components/providers/i18n-provider';

interface CreateFirstPersonPanelProps {
  onClose: () => void;
  onSave: (person: Omit<Person, 'id'>) => void;
  submitError?: string | null;
}

export default function CreateFirstPersonPanel({ onClose, onSave, submitError = null }: CreateFirstPersonPanelProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    deathDate: '',
    gender: undefined,
    photo: '',
    biography: '',
    hobbies: '',
    qualities: undefined,
  });

  const [showQualities, setShowQualities] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<IQualities>({
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
    formality: 0,
    religion: '',
    religionScale: 0,
    passions: '',
    senseOfHumor: '',
    positivity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      setFormError(t("personForm.validation.fillRequiredNames"));
      return;
    }

    setFormError(null);
    
    const personData: Omit<Person, 'id'> = {
      ...formData,
      qualities: showQualities ? qualities : undefined,
    };
    
    onSave(personData);
  };

  const handleChange = (field: keyof Omit<Person, 'id' | 'qualities'>, value: string | Gender | undefined) => {
    if (formError) {
      setFormError(null);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQualitiesChange = (field: keyof IQualities, value: string | number) => {
    setQualities((prev) => ({ ...prev, [field]: value }));
  };

  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div className="fixed right-0 top-15 z-[100] flex h-[calc(100vh-60px)] w-[min(50%,500px)] flex-col border-l border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("personForm.addYourself")}</h2>
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
          {(formError || submitError) && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              {formError ?? submitError}
            </div>
          )}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t("personForm.basicInformation")}</h3>
            <div className="space-y-4">
              {/* First Name and Last Name in one row */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("personForm.firstName")}
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />

                <Input
                  label={t("personForm.lastName")}
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              </div>

              {/* Middle Name and Gender in one row */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t("personForm.middleName")}
                  type="text"
                  value={formData.middleName || ''}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                />

                <Select
                  label={t("personForm.gender")}
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value as Gender | undefined || undefined)}
                  options={[
                    { value: '', label: t("personForm.selectGender") },
                    { value: 'male', label: t("common.male") },
                    { value: 'female', label: t("common.female") },
                    { value: 'other', label: t("common.other") },
                  ]}
                />
              </div>

              <Input
                label={t("personForm.birthDate")}
                type="date"
                value={formatDateForInput(formData.birthDate)}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />

              <Input
                label={t("personForm.deathDate")}
                type="date"
                value={formatDateForInput(formData.deathDate)}
                onChange={(e) => handleChange('deathDate', e.target.value)}
              />

              <Input
                label={t("personForm.photoUrl")}
                type="url"
                value={formData.photo || ''}
                onChange={(e) => handleChange('photo', e.target.value)}
                placeholder={t("personForm.photoUrlPlaceholder")}
              />
            </div>
          </div>

          {/* Biography Section */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t("personForm.biography")}</h3>
            <Textarea
              label=""
              value={formData.biography || ''}
              onChange={(e) => handleChange('biography', e.target.value)}
              placeholder={t("personForm.biographySelfPlaceholder")}
              rows={4}
            />
          </div>

          {/* Hobbies Section */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t("personForm.hobbies")}</h3>
            <Textarea
              label=""
              value={formData.hobbies || ''}
              onChange={(e) => handleChange('hobbies', e.target.value)}
              placeholder={t("personForm.hobbiesSelfPlaceholder")}
              rows={3}
            />
          </div>

          {/* Qualities Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("personForm.qualities")}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQualities(!showQualities)}
                className="text-green-400 hover:text-green-600"
              >
                {showQualities ? t("common.hide") : t("common.show")}
              </Button>
            </div>

            {showQualities && (
              <div className="space-y-4">
                <Input
                  label={t("personForm.openness")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.openness}
                  onChange={(e) => handleQualitiesChange('openness', parseInt(e.target.value) || 0)}
                />

                <Input
                  label={t("personForm.conscientiousness")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.conscientiousness}
                  onChange={(e) => handleQualitiesChange('conscientiousness', parseInt(e.target.value) || 0)}
                />

                <Input
                  label={t("personForm.extraversion")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.extraversion}
                  onChange={(e) => handleQualitiesChange('extraversion', parseInt(e.target.value) || 0)}
                />

                <Input
                  label={t("personForm.agreeableness")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.agreeableness}
                  onChange={(e) => handleQualitiesChange('agreeableness', parseInt(e.target.value) || 0)}
                />

                <Input
                  label={t("personForm.neuroticism")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.neuroticism}
                  onChange={(e) => handleQualitiesChange('neuroticism', parseInt(e.target.value) || 0)}
                />

                <Input
                  label={t("personForm.formality")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.formality}
                  onChange={(e) => handleQualitiesChange('formality', parseInt(e.target.value) || 0)}
                />

                <Input
                  label={t("personForm.religion")}
                  type="text"
                  value={qualities.religion}
                  onChange={(e) => handleQualitiesChange('religion', e.target.value)}
                />

                <Input
                  label={t("personForm.religiosity")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.religionScale}
                  onChange={(e) => handleQualitiesChange('religionScale', parseInt(e.target.value) || 0)}
                />

                <Input
                  label={t("personForm.passions")}
                  type="text"
                  value={qualities.passions}
                  onChange={(e) => handleQualitiesChange('passions', e.target.value)}
                />

                <Input
                  label={t("personForm.senseOfHumor")}
                  type="text"
                  value={qualities.senseOfHumor}
                  onChange={(e) => handleQualitiesChange('senseOfHumor', e.target.value)}
                />

                <Input
                  label={t("personForm.positivity")}
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.positivity}
                  onChange={(e) => handleQualitiesChange('positivity', parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Form Actions - Fixed at bottom */}
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
              {t("common.createTree")}
            </Button>
          </div>
        </div>
    </div>
  );
}


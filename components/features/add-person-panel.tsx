'use client';

import { useState, useEffect, useCallback } from 'react';
import { Person, Gender, IQualities, Relationship } from '@/types/family';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import PersonAutocomplete from '@/components/ui/person-autocomplete';

interface AddPersonPanelProps {
  onClose: () => void;
  onSave: (person: Omit<Person, 'id'>, relationship?: { type: 'parent' | 'child'; relatedPersonId: string }) => void;
  persons?: Person[]; // Список всех персон в дереве для выбора связи
  relationships?: Relationship[]; // Список всех связей для валидации
}

export default function AddPersonPanel({ onClose, onSave, persons = [], relationships = [] }: AddPersonPanelProps) {
  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    deathDate: '',
    gender: undefined,
    photo: '',
    email: '',
    qualities: undefined,
  });

  // Состояние для связи
  const [relationshipType, setRelationshipType] = useState<'parent' | 'child' | ''>('');
  const [relatedPersonId, setRelatedPersonId] = useState<string>('');
  const [relationshipError, setRelationshipError] = useState<string>('');

  const [showQualities, setShowQualities] = useState(false);
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

  const validateRelationship = useCallback(() => {
    if (!relationshipType || !relatedPersonId) {
      setRelationshipError('');
      return true;
    }

    if (relationshipType === 'parent') {
      // Новый человек является родителем выбранной персоны
      // relatedPersonId - это ребенок нового человека
      // Проверяем, можно ли добавить родителя для выбранной персоны (не более 2 родителей и разного пола)
      
      // Проверяем количество существующих родителей для этой персоны
      // relatedPersonId - это ID ребенка, для которого мы хотим добавить родителя
      // Ищем все связи, где relatedPersonId является ребенком (childId)
      if (!relationships || relationships.length === 0) {
        // Если массив связей пуст, можно добавить родителя
        setRelationshipError('');
        return true;
      }
      
      // Ищем все связи, где relatedPersonId является ребенком
      const existingParentRelations = relationships.filter((rel) => rel.childId === relatedPersonId);
      
      // Проверяем, что у ребенка меньше 2 родителей
      if (existingParentRelations.length >= 2) {
        setRelationshipError(`This person already has ${existingParentRelations.length} parent(s). Cannot add more parents.`);
        return false;
      }
      
      // Проверяем, что новый родитель не того же пола, что и существующий
      if (existingParentRelations.length > 0 && formData.gender) {
        // Находим существующих родителей
        const existingParentIds = existingParentRelations.map((rel) => rel.parentId);
        const existingParents = persons.filter((p) => existingParentIds.includes(p.id));
        
        // Проверяем, есть ли уже родитель такого же пола
        const hasSameGenderParent = existingParents.some((parent) => parent.gender === formData.gender);
        
        if (hasSameGenderParent) {
          const genderLabel = formData.gender === 'male' ? 'father' : formData.gender === 'female' ? 'mother' : 'parent';
          setRelationshipError(`This person already has a ${genderLabel}. Cannot add another ${genderLabel} of the same gender.`);
          return false;
        }
      }
      
      setRelationshipError('');
      return true;
    } else if (relationshipType === 'child') {
      // Новый человек является ребенком выбранной персоны
      // relatedPersonId - это родитель нового человека
      // Проверяем, не существует ли уже такая связь
      // Для нового человека это невозможно, но проверяем на всякий случай
      setRelationshipError('');
      return true;
    }

    setRelationshipError('');
    return true;
  }, [relationshipType, relatedPersonId, relationships, formData.gender, persons]);

  // Валидация связи при изменении
  useEffect(() => {
    if (relationshipType && relatedPersonId) {
      validateRelationship();
    } else {
      setRelationshipError('');
    }
  }, [relationshipType, relatedPersonId, validateRelationship]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидируем связь перед отправкой
    if (relationshipType && relatedPersonId) {
      if (!validateRelationship()) {
        return; // Не отправляем форму, если есть ошибка
      }
    }
    
    const personData: Omit<Person, 'id'> = {
      ...formData,
      qualities: showQualities ? qualities : undefined,
    };
    
    // Передаем информацию о связи, если она указана
    const relationship = relationshipType && relatedPersonId
      ? { type: relationshipType as 'parent' | 'child', relatedPersonId }
      : undefined;
    
    onSave(personData, relationship);
    onClose();
  };

  const handleChange = (field: keyof Omit<Person, 'id' | 'qualities'>, value: string | Gender | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQualitiesChange = (field: keyof IQualities, value: string | number) => {
    setQualities((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to convert date to string for input
  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    // If it's a Date object, format as YYYY-MM-DD
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="absolute right-0 top-0 h-full w-[min(50%,500px)] bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Add New Person</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Relationship Section */}
          {persons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Relationship</h3>
              <div className="space-y-4">
                <Select
                  label="Relationship Type"
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value as 'parent' | 'child' | '')}
                  options={[
                    { value: '', label: 'No relationship' },
                    { value: 'child', label: 'Is son/daughter of...' },
                    { value: 'parent', label: 'Is father/mother of...' },
                  ]}
                />

                {relationshipType && (
                  <div>
                    <PersonAutocomplete
                      label={relationshipType === 'child' ? 'Parent' : 'Child'}
                      persons={persons}
                      value={relatedPersonId}
                      onChange={setRelatedPersonId}
                      placeholder="Search for a person..."
                    />
                    {relationshipError && (
                      <p className="mt-2 text-sm text-red-600">{relationshipError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="First Name *"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />

              <Input
                label="Last Name *"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />

              <Input
                label="Middle Name"
                type="text"
                value={formData.middleName || ''}
                onChange={(e) => handleChange('middleName', e.target.value)}
              />

              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />

              <Select
                label="Gender"
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value as Gender | undefined || undefined)}
                options={[
                  { value: '', label: 'Select gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={formatDateForInput(formData.birthDate)}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />

              <Input
                label="Date of Death"
                type="date"
                value={formatDateForInput(formData.deathDate)}
                onChange={(e) => handleChange('deathDate', e.target.value)}
              />

              <Input
                label="Photo URL"
                type="url"
                value={formData.photo || ''}
                onChange={(e) => handleChange('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Qualities Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Qualities</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQualities(!showQualities)}
                className="text-green-400 hover:text-green-600"
              >
                {showQualities ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showQualities && (
              <div className="space-y-4">
                <Input
                  label="Openness (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.openness}
                  onChange={(e) => handleQualitiesChange('openness', parseInt(e.target.value) || 0)}
                />

                <Input
                  label="Conscientiousness (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.conscientiousness}
                  onChange={(e) => handleQualitiesChange('conscientiousness', parseInt(e.target.value) || 0)}
                />

                <Input
                  label="Extraversion (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.extraversion}
                  onChange={(e) => handleQualitiesChange('extraversion', parseInt(e.target.value) || 0)}
                />

                <Input
                  label="Agreeableness (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.agreeableness}
                  onChange={(e) => handleQualitiesChange('agreeableness', parseInt(e.target.value) || 0)}
                />

                <Input
                  label="Neuroticism (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.neuroticism}
                  onChange={(e) => handleQualitiesChange('neuroticism', parseInt(e.target.value) || 0)}
                />

                <Input
                  label="Formality (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.formality}
                  onChange={(e) => handleQualitiesChange('formality', parseInt(e.target.value) || 0)}
                />

                <Input
                  label="Religion"
                  type="text"
                  value={qualities.religion}
                  onChange={(e) => handleQualitiesChange('religion', e.target.value)}
                />

                <Input
                  label="Religion Scale (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.religionScale}
                  onChange={(e) => handleQualitiesChange('religionScale', parseInt(e.target.value) || 0)}
                />

                <Input
                  label="Passions"
                  type="text"
                  value={qualities.passions}
                  onChange={(e) => handleQualitiesChange('passions', e.target.value)}
                />

                <Input
                  label="Sense of Humor"
                  type="text"
                  value={qualities.senseOfHumor}
                  onChange={(e) => handleQualitiesChange('senseOfHumor', e.target.value)}
                />

                <Input
                  label="Positivity (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={qualities.positivity}
                  onChange={(e) => handleQualitiesChange('positivity', parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              Add Person
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}


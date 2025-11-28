'use client';

import React, { useState, useEffect, useCallback, useImperativeHandle, useRef } from 'react';
import { Person, Gender, IQualities, Relationship } from '@/types/family';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import PersonAutocomplete from '@/components/ui/person-autocomplete';
import { formatDateForInput, validateParentRelationship, validateChildRelationship, hasUnsavedPersonChanges } from '@/lib/utils';

export interface AddPersonPanelRef {
  hasUnsavedChanges: () => boolean;
}

interface AddPersonPanelProps {
  onClose: () => void;
  onSave: (person: Omit<Person, 'id'>, relationship?: { type: 'parent' | 'child'; relatedPersonId: string }) => void;
  persons?: Person[]; // List of all persons in tree for relationship selection
  relationships?: Relationship[]; // List of all relationships for validation
  mainPersonId?: string; // ID of the main person (root) - children cannot be added to root
  personToEdit?: Person; // Person to edit (if provided, panel works in edit mode)
  onUpdate?: (personId: string, person: Omit<Person, 'id'>) => void; // Callback for update (edit mode)
}

const AddPersonPanel = React.forwardRef<AddPersonPanelRef, AddPersonPanelProps>(({ 
  onClose, 
  onSave, 
  persons = [], 
  relationships = [], 
  mainPersonId,
  personToEdit,
  onUpdate
}, ref) => {
  const isEditMode = !!personToEdit;
  
  const [formData, setFormData] = useState<Omit<Person, 'id'>>(() => {
    if (personToEdit) {
      return {
        firstName: personToEdit.firstName || '',
        lastName: personToEdit.lastName || '',
        middleName: personToEdit.middleName || '',
        birthDate: personToEdit.birthDate ? (typeof personToEdit.birthDate === 'string' ? personToEdit.birthDate : new Date(personToEdit.birthDate).toISOString().split('T')[0]) : '',
        deathDate: personToEdit.deathDate ? (typeof personToEdit.deathDate === 'string' ? personToEdit.deathDate : new Date(personToEdit.deathDate).toISOString().split('T')[0]) : '',
        gender: personToEdit.gender,
        photo: personToEdit.photo || '',
        biography: personToEdit.biography || '',
        hobbies: personToEdit.hobbies || '',
        qualities: personToEdit.qualities,
      };
    }
    return {
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
    };
  });

  // State for relationship (only for add mode, not edit mode)
  const [relationshipType, setRelationshipType] = useState<'parent' | 'child' | ''>(persons.length > 0 && !isEditMode ? 'parent' : '');
  const [relationshipRole, setRelationshipRole] = useState<'father' | 'mother' | 'son' | 'daughter' | ''>(() => {
    if (isEditMode && personToEdit?.gender) {
      return personToEdit.gender === 'male' ? 'father' : personToEdit.gender === 'female' ? 'mother' : '';
    }
    return '';
  });
  const [parentGender, setParentGender] = useState<'male' | 'female' | ''>(() => {
    if (isEditMode && personToEdit?.gender) {
      return personToEdit.gender === 'male' ? 'male' : personToEdit.gender === 'female' ? 'female' : '';
    }
    return '';
  });
  const [relatedPersonId, setRelatedPersonId] = useState<string>('');
  const [relationshipError, setRelationshipError] = useState<string>('');

  const [showQualities, setShowQualities] = useState(() => {
    if (personToEdit?.qualities) {
      return true;
    }
    return false;
  });
  const [qualities, setQualities] = useState<IQualities>(() => {
    if (personToEdit?.qualities) {
      return personToEdit.qualities;
    }
    return {
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
    };
  });

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (isEditMode && personToEdit) {
      // For edit mode, use parentGender (which is derived from relationshipRole or personToEdit.gender)
      return hasUnsavedPersonChanges(formData, personToEdit, parentGender, qualities, showQualities);
    }
    return false;
  }, [isEditMode, personToEdit, formData, parentGender, qualities, showQualities]);

  // Expose hasUnsavedChanges function to parent via ref
  useImperativeHandle(ref, () => ({
    hasUnsavedChanges
  }), [hasUnsavedChanges]);

  const validateRelationship = useCallback(() => {
    // Relationship is required if there are existing persons in the tree
    if (persons.length > 0) {
      if (!relationshipType || !relatedPersonId) {
        setRelationshipError('Please select a relationship and related person');
        return false;
      }
    } else {
      // If tree is empty, relationship is optional (for first person)
      if (!relationshipType || !relatedPersonId) {
        setRelationshipError('');
        return true;
      }
    }

    // Relationship role and gender are required for relationship validation
    if (!relationshipRole || !parentGender) {
      setRelationshipError('');
      return true; // Relationship role validation will be handled separately
    }

    if (relationshipType === 'parent') {
      // New person is a parent of the selected person
      // relatedPersonId is the child of the new person
      // Check if we can add a parent for the selected person (max 2 parents of different genders)
      
      const validation = validateParentRelationship(
        relatedPersonId,
        parentGender as 'male' | 'female',
        persons,
        relationships || []
      );
      
      if (!validation.isValid) {
        setRelationshipError(validation.error || '');
        return false;
      }
      
      setRelationshipError('');
      return true;
    } else if (relationshipType === 'child') {
      // New person is a child of the selected person
      // relatedPersonId is the parent of the new person
      
      const validation = validateChildRelationship(relatedPersonId, mainPersonId, persons);
      
      if (!validation.isValid) {
        setRelationshipError(validation.error || '');
        return false;
      }
      
      // Multiple children of the same gender are allowed, so no duplicate check needed
      setRelationshipError('');
      return true;
    }

    setRelationshipError('');
    return true;
  }, [relationshipType, relatedPersonId, relationships, parentGender, relationshipRole, persons, mainPersonId]);

  // Validate relationship on change
  useEffect(() => {
    validateRelationship();
  }, [validateRelationship]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      // Edit mode: just update the person
      if (!personToEdit) return;
      
      const personData: Omit<Person, 'id'> = {
        ...formData,
        gender: parentGender || formData.gender,
        qualities: showQualities ? qualities : undefined,
      };
      
      if (onUpdate) {
        onUpdate(personToEdit.id, personData);
      }
      onClose();
      return;
    }
    
    // Add mode: validate relationship
    // Validate relationship type and gender if relationship is required
    if (persons.length > 0) {
      if (!parentGender || !relationshipType) {
        setRelationshipError('Please select a relationship type (Father, Mother, Son, or Daughter)');
        return;
      }
      if (!relatedPersonId) {
        setRelationshipError('Please select a person');
        return;
      }
    }
    
    // Validate relationship before submission
    if (!validateRelationship()) {
      return; // Don't submit form if there's an error
    }
    
    // Relationship is required if there are existing persons
    if (persons.length > 0 && (!relationshipType || !relatedPersonId)) {
      setRelationshipError('Please select a relationship and related person');
      return;
    }
    
    // Set gender automatically based on parent gender selection
    const personData: Omit<Person, 'id'> = {
      ...formData,
      gender: parentGender || formData.gender,
      qualities: showQualities ? qualities : undefined,
    };
    
    // Pass relationship information if specified
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

  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div 
      className="absolute right-0 top-0 h-full w-[min(50%,500px)] bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-shrink-0 p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Person' : 'Add New Person'}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Relationship Section - only show in add mode */}
          {persons.length > 0 && !isEditMode && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Relationship *</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Is *"
                    value={relationshipRole}
                    onChange={(e) => {
                      const value = e.target.value as 'father' | 'mother' | 'son' | 'daughter' | '';
                      let gender: 'male' | 'female' | '' = '';
                      let relType: 'parent' | 'child' | '' = '';
                      
                      if (value === 'father') {
                        gender = 'male';
                        relType = 'parent';
                      } else if (value === 'mother') {
                        gender = 'female';
                        relType = 'parent';
                      } else if (value === 'son') {
                        gender = 'male';
                        relType = 'child';
                      } else if (value === 'daughter') {
                        gender = 'female';
                        relType = 'child';
                      }
                      
                      setRelationshipRole(value);
                      setParentGender(gender);
                      setRelationshipType(relType);
                      // Auto-set gender in formData
                      handleChange('gender', gender || undefined);
                      if (relationshipError) setRelationshipError('');
                    }}
                    required
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'father', label: 'Father' },
                      { value: 'mother', label: 'Mother' },
                      { value: 'son', label: 'Son' },
                      { value: 'daughter', label: 'Daughter' },
                    ]}
                  />
                  <PersonAutocomplete
                    label={'Of *'}
                    persons={persons}
                    value={relatedPersonId}
                    onChange={setRelatedPersonId}
                    placeholder={relationshipRole ? "Search for a person..." : "Select relationship first"}
                    required
                  />
                </div>
                {relationshipError && (
                  <p className="mt-2 text-sm text-red-600">{relationshipError}</p>
                )}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-4">
              {/* First Name and Last Name in one row */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <Input
                label="Middle Name"
                type="text"
                value={formData.middleName || ''}
                onChange={(e) => handleChange('middleName', e.target.value)}
              />

              {/* Date of Birth and Date of Death in one row */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <Input
                label="Photo URL"
                type="url"
                value={formData.photo || ''}
                onChange={(e) => handleChange('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Biography Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Biography</h3>
            <Textarea
              label=""
              value={formData.biography || ''}
              onChange={(e) => handleChange('biography', e.target.value)}
              placeholder="Tell us about this person..."
              rows={4}
            />
          </div>

          {/* Hobbies Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Hobbies</h3>
            <Textarea
              label=""
              value={formData.hobbies || ''}
              onChange={(e) => handleChange('hobbies', e.target.value)}
              placeholder="List hobbies and interests..."
              rows={3}
            />
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
        </div>
      </form>

      {/* Form Actions - Fixed at bottom */}
      <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white">
        <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
            type="button"
              variant="primary"
            onClick={handleFormSubmit}
              className="flex-1"
            >
              {isEditMode ? 'Save Changes' : 'Add Person'}
            </Button>
          </div>
        </div>
    </div>
  );
});

AddPersonPanel.displayName = 'AddPersonPanel';

export default AddPersonPanel;


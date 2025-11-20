'use client';

import { useState } from 'react';
import { Person, Gender, IQualities } from '@/types/family';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';

interface CreateFirstPersonPanelProps {
  onClose: () => void;
  onSave: (person: Omit<Person, 'id'>) => void;
}

export default function CreateFirstPersonPanel({ onClose, onSave }: CreateFirstPersonPanelProps) {
  const [formData, setFormData] = useState<Omit<Person, 'id'>>({
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    deathDate: '',
    gender: undefined,
    photo: '',
    qualities: undefined,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      alert('Please fill in first name and last name');
      return;
    }
    
    const personData: Omit<Person, 'id'> = {
      ...formData,
      qualities: showQualities ? qualities : undefined,
    };
    
    onSave(personData);
  };

  const handleChange = (field: keyof Omit<Person, 'id' | 'qualities'>, value: string | Gender | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQualitiesChange = (field: keyof IQualities, value: string | number) => {
    setQualities((prev) => ({ ...prev, [field]: value }));
  };

  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed right-0 top-15 h-[calc(100vh-60px)] w-[min(50%,500px)] bg-white border-l border-gray-200 shadow-lg z-[100] flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Add Yourself</h2>
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
                label="Birth Date"
                type="date"
                value={formatDateForInput(formData.birthDate)}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />

              <Input
                label="Death Date"
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
                  label="Religiosity (0-100)"
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
              Create Tree
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}


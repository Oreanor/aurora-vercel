'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { Person } from '@/types/family';
import { getPersonFullName } from '@/lib/utils';
import { useI18n } from '@/components/providers/i18n-provider';

interface PersonAutocompleteProps {
  label?: string;
  persons: Person[];
  value: string;
  onChange: (personId: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function PersonAutocomplete({
  label,
  persons,
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
}: PersonAutocompleteProps) {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteId = useId();
  const inputId = `person-autocomplete-${autocompleteId}`;
  const listboxId = `${inputId}-listbox`;

  // Get selected person name for display
  const selectedPerson = persons.find((p) => p.id === value);
  const displayValue = selectedPerson ? getPersonFullName(selectedPerson) : searchTerm;

  // Filter persons based on search term
  const filteredPersons = persons.filter((person) => {
    if (!searchTerm) return true;
    const fullName = getPersonFullName(person).toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search);
  });
  const activeOptionId =
    focusedIndex >= 0 && focusedIndex < filteredPersons.length
      ? `${inputId}-option-${filteredPersons[focusedIndex].id}`
      : undefined;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!selectedPerson) {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedPerson]);

  const handleSelect = (person: Person) => {
    onChange(person.id);
    setSearchTerm('');
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const normalizedValue =
      selectedPerson && newValue.startsWith(displayValue)
        ? newValue.slice(displayValue.length)
        : newValue;
    setSearchTerm(normalizedValue);
    setIsOpen(true);
    setFocusedIndex(-1);
    if (selectedPerson) {
      onChange('');
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedPerson) {
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < filteredPersons.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredPersons.length) {
          handleSelect(filteredPersons[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        if (!selectedPerson) {
          setSearchTerm('');
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("common.searchPerson")}
          required={required}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {isOpen && filteredPersons.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-popover shadow-lg"
          >
            {filteredPersons.map((person, index) => {
              const fullName = getPersonFullName(person);
              const isFocused = index === focusedIndex;
              const isSelected = person.id === value;
              
              return (
                <div
                  id={`${inputId}-option-${person.id}`}
                  key={person.id}
                  onClick={() => handleSelect(person)}
                  role="option"
                  aria-selected={isSelected}
                  className={`cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground ${
                    isFocused ? 'bg-accent text-accent-foreground' : ''
                  } ${isSelected ? 'bg-brand/10 text-brand' : ''}`}
                >
                  <div className="font-medium text-popover-foreground">{fullName}</div>
                </div>
              );
            })}
          </div>
        )}
        {isOpen && searchTerm && filteredPersons.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-3 text-sm text-muted-foreground shadow-lg">
            {t("common.noPersonsFound")}
          </div>
        )}
      </div>
    </div>
  );
}


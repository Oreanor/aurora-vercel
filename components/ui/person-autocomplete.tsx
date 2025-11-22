'use client';

import { useState, useRef, useEffect } from 'react';
import { Person } from '@/types/family';
import { getPersonFullName } from '@/lib/utils';

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
  placeholder = 'Search for a person...',
  className = '',
  required = false,
}: PersonAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setSearchTerm(newValue);
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {isOpen && filteredPersons.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredPersons.map((person, index) => {
              const fullName = getPersonFullName(person);
              const isFocused = index === focusedIndex;
              const isSelected = person.id === value;
              
              return (
                <div
                  key={person.id}
                  onClick={() => handleSelect(person)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    isFocused ? 'bg-gray-100' : ''
                  } ${isSelected ? 'bg-green-50' : ''}`}
                >
                  <div className="font-medium text-gray-900">{fullName}</div>
                </div>
              );
            })}
          </div>
        )}
        {isOpen && searchTerm && filteredPersons.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-500">
            No persons found
          </div>
        )}
      </div>
    </div>
  );
}


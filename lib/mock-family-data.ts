import { FamilyTreeData } from '@/types/family';

/**
 * Mock-данные для генеалогического дерева
 * Человек с двумя родителями и бабушками-дедушками
 */
export const mockFamilyData: FamilyTreeData = {
  persons: [
    // Главный человек
    {
      id: 'person-1',
      firstName: 'John',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1990-05-15',
      gender: 'male',
    },
    // Родители
    {
      id: 'person-2',
      firstName: 'Alex',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1965-03-20',
      gender: 'male',
    },
    {
      id: 'person-3',
      firstName: 'Mary',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1967-08-10',
      gender: 'female',
    },
    // Дедушка и бабушка по отцу
    {
      id: 'person-4',
      firstName: 'Peter',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1940-01-15',
      deathDate: '2010-12-05',
      gender: 'male',
    },
    {
      id: 'person-5',
      firstName: 'Anna',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1942-06-22',
      gender: 'female',
    },
    // Дедушка и бабушка по матери
    {
      id: 'person-6',
      firstName: 'Sergey',
      lastName: 'Petrov',
      middleName: '',
      birthDate: '1938-11-30',
      deathDate: '2008-03-18',
      gender: 'male',
    },
    {
      id: 'person-7',
      firstName: 'Elena',
      lastName: 'Petrov',
      middleName: '',
      birthDate: '1945-04-12',
      gender: 'female',
    },
  ],
  relationships: [
    // John - son of Alex
    {
      id: 'rel-1',
      parentId: 'person-2',
      childId: 'person-1',
    },
    // John - son of Mary
    {
      id: 'rel-2',
      parentId: 'person-3',
      childId: 'person-1',
    },
    // Alex - son of Peter
    {
      id: 'rel-3',
      parentId: 'person-4',
      childId: 'person-2',
    },
    // Alex - son of Anna
    {
      id: 'rel-4',
      parentId: 'person-5',
      childId: 'person-2',
    },
    // Mary - daughter of Sergey
    {
      id: 'rel-5',
      parentId: 'person-6',
      childId: 'person-3',
    },
    // Mary - daughter of Elena
    {
      id: 'rel-6',
      parentId: 'person-7',
      childId: 'person-3',
    },
  ],
};


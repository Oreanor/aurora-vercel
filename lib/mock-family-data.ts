import { FamilyTreeData, FamilyTree } from '@/types/family';

/**
 * Mock data for the first family tree
 * Person with two parents and grandparents
 */
const mockFamilyData1: FamilyTreeData = {
  persons: [
    // Main person
    {
      id: 'person-1',
      firstName: 'John',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1990-05-15',
      gender: 'male',
      email: 'oreanor@gmail.com', // User email for identification
    },
    // Parents
    {
      id: 'person-2',
      firstName: 'Alex',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1965-03-20',
      gender: 'male',
      email: 'alex.smith@example.com', // Example: email for another user
    },
    {
      id: 'person-3',
      firstName: 'Mary',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1967-08-10',
      gender: 'female',
    },
    // Grandfather and grandmother on father's side
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
    // Grandfather and grandmother on mother's side
    {
      id: 'person-6',
      firstName: 'Sergey',
      lastName: 'Petrov',
      middleName: 'Petrovich',
      birthDate: '1938-11-30',
      deathDate: '2008-03-18',
      gender: 'male',
    },
    {
      id: 'person-7',
      firstName: 'Elena',
      middleName: 'Ivanovna',
      lastName: 'Petrov',
      birthDate: '1945-04-12',
      gender: 'female',
    },
    // Great-grandfather on father's side (father of Peter)
    {
      id: 'person-8',
      firstName: 'William',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1915-05-20',
      deathDate: '1985-09-10',
      gender: 'male',
    },
    // Great-grandmother on father's side (mother of Anna)
    {
      id: 'person-9',
      firstName: 'Margaret',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1918-09-14',
      deathDate: '1992-07-22',
      gender: 'female',
    },
    // Great-grandfather on mother's side (father of Sergey)
    {
      id: 'person-10',
      firstName: 'Ivan',
      lastName: 'Petrov',
      middleName: 'Vasilievich',
      birthDate: '1910-12-05',
      deathDate: '1980-04-30',
      gender: 'male',
    },
    // Great-grandmother on mother's side (mother of Elena)
    {
      id: 'person-11',
      firstName: 'Sofia',
      lastName: 'Ivanova',
      middleName: 'Nikolaevna',
      birthDate: '1912-03-18',
      deathDate: '1995-11-08',
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
    // Peter - son of William
    {
      id: 'rel-7',
      parentId: 'person-8',
      childId: 'person-4',
    },
    // Anna - daughter of Margaret
    {
      id: 'rel-8',
      parentId: 'person-9',
      childId: 'person-5',
    },
    // Sergey - son of Ivan
    {
      id: 'rel-9',
      parentId: 'person-10',
      childId: 'person-6',
    },
    // Elena - daughter of Sofia
    {
      id: 'rel-10',
      parentId: 'person-11',
      childId: 'person-7',
    },
  ],
};

/**
 * Mock-данные для второго генеалогического дерева (упрощенное)
 */
const mockFamilyData2: FamilyTreeData = {
  persons: [
    {
      id: 'person-2-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      middleName: '',
      birthDate: '1985-07-20',
      gender: 'female',
      email: 'alice.johnson@example.com',
    },
    {
      id: 'person-2-2',
      firstName: 'Robert',
      lastName: 'Johnson',
      middleName: '',
      birthDate: '1960-01-10',
      gender: 'male',
    },
    {
      id: 'person-2-3',
      firstName: 'Linda',
      lastName: 'Johnson',
      middleName: '',
      birthDate: '1962-03-15',
      gender: 'female',
    },
  ],
  relationships: [
    {
      id: 'rel-2-1',
      parentId: 'person-2-2',
      childId: 'person-2-1',
    },
    {
      id: 'rel-2-2',
      parentId: 'person-2-3',
      childId: 'person-2-1',
    },
  ],
};

/**
 * Mock-данные для третьего генеалогического дерева (упрощенное)
 */
const mockFamilyData3: FamilyTreeData = {
  persons: [
    {
      id: 'person-3-1',
      firstName: 'Michael',
      lastName: 'Brown',
      middleName: '',
      birthDate: '1992-11-05',
      gender: 'male',
      email: 'michael.brown@example.com',
    },
    {
      id: 'person-3-2',
      firstName: 'David',
      lastName: 'Brown',
      middleName: '',
      birthDate: '1970-09-12',
      gender: 'male',
    },
  ],
  relationships: [
    {
      id: 'rel-3-1',
      parentId: 'person-3-2',
      childId: 'person-3-1',
    },
  ],
};

/**
 * Массив всех мок-деревьев с правами доступа
 */
export const mockFamilyTrees: FamilyTree[] = [
  {
    id: 'tree-1',
    name: 'Smith Family Tree',
    data: mockFamilyData1,
    access: {
      owner: ['oreanor@gmail.com'],
      editor: ['alex.smith@example.com'],
      viewer: ['viewer1@example.com', 'viewer2@example.com'],
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: 'tree-2',
    name: 'Johnson Family Tree',
    data: mockFamilyData2,
    access: {
      owner: ['alice.johnson@example.com'],
      editor: ['oreanor@gmail.com'],
      viewer: [],
    },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-05T14:20:00Z',
  },
  {
    id: 'tree-3',
    name: 'Brown Family Tree',
    data: mockFamilyData3,
    access: {
      owner: ['michael.brown@example.com'],
      editor: ['oreanor@gmail.com', 'alex.smith@example.com'],
      viewer: ['viewer1@example.com'],
    },
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-12T16:45:00Z',
  },
];

/**
 * Обратная совместимость: экспорт первого дерева как mockFamilyData
 */
export const mockFamilyData: FamilyTreeData = mockFamilyData1;


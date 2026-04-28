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
    // Sons of Peter Smith (brothers of Alex)
    {
      id: 'person-12',
      firstName: 'Robert',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1962-04-10',
      gender: 'male',
    },
    {
      id: 'person-13',
      firstName: 'James',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1965-09-22',
      gender: 'male',
    },
    // Children of Alex and Mary (siblings of John)
    {
      id: 'person-1-2',
      firstName: 'Emma',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1993-02-11',
      gender: 'female',
    },
    {
      id: 'person-1-3',
      firstName: 'Mark',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1995-09-30',
      gender: 'male',
    },
    // Sons of Robert Smith (grandsons of Peter)
    {
      id: 'person-14',
      firstName: 'Thomas',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1985-07-15',
      gender: 'male',
    },
    {
      id: 'person-15',
      firstName: 'Daniel',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1988-11-30',
      gender: 'male',
    },
    // Son of James Smith (grandson of Peter)
    {
      id: 'person-16',
      firstName: 'Christopher',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1990-03-08',
      gender: 'male',
    },
    // Adopted son of Robert Smith
    {
      id: 'person-12-adopted',
      firstName: 'Tom',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1992-06-10',
      gender: 'male',
    },
    // Mary's sisters (daughters of Sergey and Elena)
    {
      id: 'person-m3-1',
      firstName: 'Olga',
      lastName: 'Petrov',
      middleName: 'Sergeevna',
      birthDate: '1962-05-12',
      gender: 'female',
    },
    {
      id: 'person-m3-2',
      firstName: 'Nina',
      lastName: 'Petrov',
      middleName: 'Sergeevna',
      birthDate: '1970-11-08',
      gender: 'female',
    },
    // Olga's spouse and son
    {
      id: 'person-m3-1-spouse',
      firstName: 'Igor',
      lastName: 'Kozlov',
      middleName: '',
      birthDate: '1960-07-22',
      gender: 'male',
    },
    {
      id: 'person-m3-1-son',
      firstName: 'Dmitry',
      lastName: 'Kozlov',
      middleName: '',
      birthDate: '1988-02-14',
      gender: 'male',
    },
    // Dmitry's spouse and two children (pair of grandchildren)
    {
      id: 'person-m3-1-son-wife',
      firstName: 'Lena',
      lastName: 'Kozlova',
      middleName: '',
      birthDate: '1990-04-05',
      gender: 'female',
    },
    {
      id: 'person-m3-1-gc1',
      firstName: 'Misha',
      lastName: 'Kozlov',
      middleName: '',
      birthDate: '2012-06-10',
      gender: 'male',
    },
    {
      id: 'person-m3-1-gc2',
      firstName: 'Dasha',
      lastName: 'Kozlova',
      middleName: '',
      birthDate: '2015-09-20',
      gender: 'female',
    },
    // Nina's spouse and son
    {
      id: 'person-m3-2-spouse',
      firstName: 'Pavel',
      lastName: 'Volkov',
      middleName: '',
      birthDate: '1968-03-30',
      gender: 'male',
    },
    {
      id: 'person-m3-2-son',
      firstName: 'Andrey',
      lastName: 'Volkov',
      middleName: '',
      birthDate: '1993-08-01',
      gender: 'male',
    },
    // Andrey's spouse and two children (pair of grandchildren)
    {
      id: 'person-m3-2-son-wife',
      firstName: 'Kate',
      lastName: 'Volkova',
      middleName: '',
      birthDate: '1995-01-15',
      gender: 'female',
    },
    {
      id: 'person-m3-2-gc1',
      firstName: 'Sasha',
      lastName: 'Volkov',
      middleName: '',
      birthDate: '2018-04-12',
      gender: 'male',
    },
    {
      id: 'person-m3-2-gc2',
      firstName: 'Vera',
      lastName: 'Volkova',
      middleName: '',
      birthDate: '2020-11-03',
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
    // Emma - daughter of Alex
    {
      id: 'rel-1-2a',
      parentId: 'person-2',
      childId: 'person-1-2',
    },
    // Emma - daughter of Mary
    {
      id: 'rel-1-2b',
      parentId: 'person-3',
      childId: 'person-1-2',
    },
    // Mark - son of Alex
    {
      id: 'rel-1-3a',
      parentId: 'person-2',
      childId: 'person-1-3',
    },
    // Mark - son of Mary
    {
      id: 'rel-1-3b',
      parentId: 'person-3',
      childId: 'person-1-3',
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
    // Robert - son of Peter
    {
      id: 'rel-11',
      parentId: 'person-4',
      childId: 'person-12',
    },
    // James - son of Peter
    {
      id: 'rel-12',
      parentId: 'person-4',
      childId: 'person-13',
    },
    // Thomas - son of Robert
    {
      id: 'rel-13',
      parentId: 'person-12',
      childId: 'person-14',
    },
    // Daniel - son of Robert
    {
      id: 'rel-14',
      parentId: 'person-12',
      childId: 'person-15',
    },
    // Tom - adopted son of Robert
    {
      id: 'rel-12-adopted',
      parentId: 'person-12',
      childId: 'person-12-adopted',
      type: 'adopted',
    },
    // Christopher - son of James
    {
      id: 'rel-15',
      parentId: 'person-13',
      childId: 'person-16',
    },
    // Olga - daughter of Sergey and Elena (Mary's sister)
    { id: 'rel-m3-1a', parentId: 'person-6', childId: 'person-m3-1' },
    { id: 'rel-m3-1b', parentId: 'person-7', childId: 'person-m3-1' },
    // Nina - daughter of Sergey and Elena (Mary's sister)
    { id: 'rel-m3-2a', parentId: 'person-6', childId: 'person-m3-2' },
    { id: 'rel-m3-2b', parentId: 'person-7', childId: 'person-m3-2' },
    // Dmitry - son of Olga and Igor
    { id: 'rel-m3-1c', parentId: 'person-m3-1', childId: 'person-m3-1-son' },
    { id: 'rel-m3-1d', parentId: 'person-m3-1-spouse', childId: 'person-m3-1-son' },
    // Misha and Dasha - children of Dmitry and Lena
    { id: 'rel-m3-1e', parentId: 'person-m3-1-son', childId: 'person-m3-1-gc1' },
    { id: 'rel-m3-1f', parentId: 'person-m3-1-son-wife', childId: 'person-m3-1-gc1' },
    { id: 'rel-m3-1g', parentId: 'person-m3-1-son', childId: 'person-m3-1-gc2' },
    { id: 'rel-m3-1h', parentId: 'person-m3-1-son-wife', childId: 'person-m3-1-gc2' },
    // Andrey - son of Nina and Pavel
    { id: 'rel-m3-2c', parentId: 'person-m3-2', childId: 'person-m3-2-son' },
    { id: 'rel-m3-2d', parentId: 'person-m3-2-spouse', childId: 'person-m3-2-son' },
    // Sasha and Vera - children of Andrey and Kate
    { id: 'rel-m3-2e', parentId: 'person-m3-2-son', childId: 'person-m3-2-gc1' },
    { id: 'rel-m3-2f', parentId: 'person-m3-2-son-wife', childId: 'person-m3-2-gc1' },
    { id: 'rel-m3-2g', parentId: 'person-m3-2-son', childId: 'person-m3-2-gc2' },
    { id: 'rel-m3-2h', parentId: 'person-m3-2-son-wife', childId: 'person-m3-2-gc2' },
  ],
};

/**
 * Mock data for the second family tree (simplified)
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
 * Mock data for the third family tree (simplified)
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
 * Array of all mock trees with access rights
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
 * Backward compatibility: export first tree as mockFamilyData
 */
export const mockFamilyData: FamilyTreeData = mockFamilyData1;


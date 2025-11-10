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
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Алексеевич',
      birthDate: '1990-05-15',
      gender: 'male',
    },
    // Родители
    {
      id: 'person-2',
      firstName: 'Алексей',
      lastName: 'Иванов',
      middleName: 'Петрович',
      birthDate: '1965-03-20',
      gender: 'male',
    },
    {
      id: 'person-3',
      firstName: 'Мария',
      lastName: 'Иванова',
      middleName: 'Сергеевна',
      birthDate: '1967-08-10',
      gender: 'female',
    },
    // Дедушка и бабушка по отцу
    {
      id: 'person-4',
      firstName: 'Петр',
      lastName: 'Иванов',
      middleName: 'Николаевич',
      birthDate: '1940-01-15',
      deathDate: '2010-12-05',
      gender: 'male',
    },
    {
      id: 'person-5',
      firstName: 'Анна',
      lastName: 'Иванова',
      middleName: 'Васильевна',
      birthDate: '1942-06-22',
      gender: 'female',
    },
    // Дедушка и бабушка по матери
    {
      id: 'person-6',
      firstName: 'Сергей',
      lastName: 'Петров',
      middleName: 'Иванович',
      birthDate: '1938-11-30',
      deathDate: '2008-03-18',
      gender: 'male',
    },
    {
      id: 'person-7',
      firstName: 'Елена',
      lastName: 'Петрова',
      middleName: 'Дмитриевна',
      birthDate: '1945-04-12',
      gender: 'female',
    },
  ],
  relationships: [
    // Иван - сын Алексея
    {
      id: 'rel-1',
      parentId: 'person-2',
      childId: 'person-1',
    },
    // Иван - сын Марии
    {
      id: 'rel-2',
      parentId: 'person-3',
      childId: 'person-1',
    },
    // Алексей - сын Петра
    {
      id: 'rel-3',
      parentId: 'person-4',
      childId: 'person-2',
    },
    // Алексей - сын Анны
    {
      id: 'rel-4',
      parentId: 'person-5',
      childId: 'person-2',
    },
    // Мария - дочь Сергея
    {
      id: 'rel-5',
      parentId: 'person-6',
      childId: 'person-3',
    },
    // Мария - дочь Елены
    {
      id: 'rel-6',
      parentId: 'person-7',
      childId: 'person-3',
    },
  ],
};


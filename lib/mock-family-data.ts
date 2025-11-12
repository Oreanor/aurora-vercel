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
      email: 'oreanor@gmail.com', // Email пользователя для идентификации
    },
    // Родители
    {
      id: 'person-2',
      firstName: 'Alex',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1965-03-20',
      gender: 'male',
      email: 'alex.smith@example.com', // Пример: email для другого пользователя
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
    // Прадедушка по отцу (отец Peter)
    {
      id: 'person-8',
      firstName: 'William',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1915-05-20',
      deathDate: '1985-09-10',
      gender: 'male',
    },
    // Прабабушка по отцу (мать Anna)
    {
      id: 'person-9',
      firstName: 'Margaret',
      lastName: 'Smith',
      middleName: '',
      birthDate: '1918-09-14',
      deathDate: '1992-07-22',
      gender: 'female',
    },
    // Прадедушка по матери (отец Sergey)
    {
      id: 'person-10',
      firstName: 'Ivan',
      lastName: 'Petrov',
      middleName: 'Vasilievich',
      birthDate: '1910-12-05',
      deathDate: '1980-04-30',
      gender: 'male',
    },
    // Прабабушка по матери (мать Elena)
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


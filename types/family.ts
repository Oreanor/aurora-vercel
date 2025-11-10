/**
 * Типы данных для семейного дерева (React Flow)
 */

/**
 * Пол человека
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Человек в семейном дереве
 */
export interface Person {
  id: string;
  firstName: string; // имя
  lastName: string; // фамилия
  middleName?: string; // отчество
  birthDate?: Date | string; // дата рождения
  deathDate?: Date | string; // дата смерти (если человек умер)
  gender?: Gender; // пол
  photo?: string; // URL фотографии
  qualities?: IQualities; // качества
}

export interface IQualities {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  formality: number;
  religion: string;
  religionScale: number;
  passions: string;
  senseOfHumor: string;
  positivity: number;
}

/**
 * Связь родитель-ребенок
 */
export interface Relationship {
  id: string;
  parentId: string; // ID родителя
  childId: string; // ID ребенка
}

/**
 * Данные генеалогического дерева для React Flow
 */
export interface FamilyTreeData {
  persons: Person[];
  relationships: Relationship[];
}


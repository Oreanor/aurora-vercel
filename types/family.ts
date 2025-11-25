/**
 * Data types for family tree (React Flow)
 */

/**
 * Person's gender
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Person in the family tree
 */
export interface Person {
  id: string;
  firstName: string; // first name
  lastName: string; // last name
  middleName?: string; // middle name
  birthDate?: Date | string; // birth date
  deathDate?: Date | string; // death date (if person has died)
  gender?: Gender; // gender
  photo?: string; // photo URL
  qualities?: IQualities; // qualities
  email?: string; // user email for identification and invitations
  biography?: string; // biography text
  hobbies?: string; // hobbies text
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
 * Parent-child relationship
 */
export interface Relationship {
  id: string;
  parentId: string; // Parent ID
  childId: string; // Child ID
}

/**
 * Family tree data for React Flow
 */
export interface FamilyTreeData {
  persons: Person[];
  relationships: Relationship[];
}

/**
 * Tree access rights
 */
export interface TreeAccess {
  owner: string[];   // Array of owner emails
  editor: string[];  // Array of editor emails
  viewer: string[];  // Array of viewer emails
}

/**
 * Tree with metadata and access rights
 */
export interface FamilyTree {
  id: string;                    // Unique tree ID
  name?: string;                 // Tree name (optional)
  data: FamilyTreeData;          // Tree data
  access: TreeAccess;            // Access rights
  createdAt?: string;            // Creation date
  updatedAt?: string;            // Update date
}


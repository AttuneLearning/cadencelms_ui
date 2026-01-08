/**
 * Auth types and interfaces
 */

export type Role = 'learner' | 'staff' | 'global-admin';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  role: Role;
  roles: Role[];
}

export interface User {
  _id: string;
  email: string;
  roles: Role[];
}

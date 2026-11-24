export type UserRole = 'ENGINEER' | 'REVIEWER' | 'ADMIN';
export type UnitSystem = 'FIELD' | 'SI';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferredUnitSystem: UnitSystem;
}

export interface AuthSession {
  user: AuthUser;
}

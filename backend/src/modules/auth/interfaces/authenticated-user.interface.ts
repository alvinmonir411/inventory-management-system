import type { RoleName } from '../../roles/types/role-name.type';

export type AuthenticatedUser = {
  id: string;
  username: string;
  role: RoleName;
};

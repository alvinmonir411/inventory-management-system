import type { RoleName } from '../../roles/types/role-name.type';

export type JwtPayload = {
  sub: string;
  username: string;
  role: RoleName;
};

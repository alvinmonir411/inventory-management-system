export type AuthUser = {
  id: string;
  username: string;
  role: string;
};

export type AuthSession = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
};

export type LoginInput = {
  username: string;
  password: string;
};

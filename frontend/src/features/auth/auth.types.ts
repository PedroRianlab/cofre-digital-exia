export type AuthCredentials = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type RegisterResponse = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

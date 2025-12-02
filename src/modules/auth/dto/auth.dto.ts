import { User } from 'generated/prisma/client';

export type RegisterDTO = Pick<User, 'name' | 'email' | 'password'>;

export type LoginDTO = Pick<User, 'email' | 'password'>;

export type UserResponseDTO = {
  token: string;
  user: Omit<User, 'password'>;
};

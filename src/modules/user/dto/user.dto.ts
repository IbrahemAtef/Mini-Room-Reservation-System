import { User } from 'generated/prisma/client';

export type UpdateUserDTO = Partial<Pick<User, 'name' | 'email'>>;

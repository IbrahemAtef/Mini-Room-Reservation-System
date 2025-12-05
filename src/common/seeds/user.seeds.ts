import { User, UserRole } from 'generated/prisma/client';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';

const generateUserSeed = async (role: 'GUEST' | 'OWNER') => {
  const seededUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: await argon.hash('1234567'),
    role,
  };
  return seededUser;
};

export const randomUsers = Array.from({ length: 6 }, async (_, i) => {
  const role = i % 2 === 0 ? UserRole.GUEST : UserRole.OWNER;
  return await generateUserSeed(role);
});

export const getGuestUser = async () =>
  ({
    name: 'Guest',
    email: 'guest@example.com',
    password: await argon.hash('1234567'),
    role: UserRole.GUEST,
  }) as const;

export const getOwnerUser = async () =>
  ({
    name: 'Owner',
    email: 'owner@example.com',
    password: await argon.hash('1234567'),
    role: UserRole.OWNER,
  }) as const;

export const getAdminUser = async () =>
  ({
    name: 'Admin',
    email: 'admin@example.com',
    password: await argon.hash('admin123'),
    role: UserRole.ADMIN,
  }) as const;

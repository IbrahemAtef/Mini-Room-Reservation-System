import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../../generated/prisma/client';
import { generateUserSeed, getGuestUser, getAdminUser } from './user.seeds.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Create adapter
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

// Create prisma client
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete all records from all tables
  await prisma.user.deleteMany({});

  // Reseed users (including admin)
  const userSeeds = faker.helpers.multiple(generateUserSeed, { count: 15 });
  const guestUser = await getGuestUser();
  const adminUser = await getAdminUser();

  await prisma.user.createMany({
    // This might fail if userSeeds contains duplicate emails
    data: [...userSeeds, guestUser, adminUser],
  });

  console.log('Database has been seeded successfully.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

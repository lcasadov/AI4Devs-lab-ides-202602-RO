import { getPrismaClient } from '../src/infrastructure/database/prisma-client';
import { hashPassword } from '../src/infrastructure/utils/passwordUtils';

async function main(): Promise<void> {
  const prisma = getPrismaClient();

  const existingAdmin = await prisma.user.findUnique({ where: { login: 'admin' } });

  if (!existingAdmin) {
    const passwordHash = await hashPassword('Admin@1234');
    await prisma.user.create({
      data: {
        login: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@lti.com',
        passwordHash,
        role: 'ADMIN',
        active: true,
      },
    });
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists. Skipping seed.');
  }

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

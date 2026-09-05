import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './lib/prisma';
import { Role } from '@prisma/client';

async function main() {
  const email = process.argv[2]?.toLowerCase();

  if (!email) {
    console.error('Usage: ts-node set-admin.ts <email>');
    console.error('Example: ts-node set-admin.ts admin@example.com');
    process.exit(1);
  }

  // Basic email format check
  if (!email.includes('@') || !email.includes('.')) {
    console.error('Error: Invalid email format');
    process.exit(1);
  }

  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.ADMIN,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        role: Role.ADMIN,
      },
    });
  }

  console.log('Successfully set/created admin user:', user.id, user.email);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error running set-admin script:', err);
  process.exit(1);
});

import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makePrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if (connectionString) {
      const adapter = new PrismaNeon({ connectionString });
      return new PrismaClient({ adapter });
    }

    return new PrismaClient();
  }

  export const db = globalForPrisma.prisma ?? makePrismaClient();

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

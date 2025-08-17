import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development and with hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		// log: ['query', 'error', 'warn'], // Uncomment for debugging
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

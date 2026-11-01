import { PrismaClient } from "@prisma/client";

// Fallback jika .env belum dibuat atau DATABASE_URL belum diset di environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mysql://root:@localhost:3306/kamarkos_db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

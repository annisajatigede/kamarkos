import { PrismaClient } from "@prisma/client";

// Fallback ke Hostinger database jika .env belum dibuat atau DATABASE_URL belum diset di Vercel Environment Variables
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "mysql://u667068812_kamarkos:kamarKos2026@srv1153.hstgr.io:3306/u667068812_kamarkos?connect_timeout=30&pool_timeout=30";
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

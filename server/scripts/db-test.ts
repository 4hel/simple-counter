import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "../src/db-config.js";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

async function main() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection OK.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Database connection failed.");
    console.error("Please check DB_HOST, DB_PORT, DB_USERNAME and DB_PASSWORD in server/.env.");
    console.error(message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();

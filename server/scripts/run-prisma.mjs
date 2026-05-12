import "dotenv/config";
import { spawn } from "node:child_process";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = requiredEnv("DB_HOST");
  const port = requiredEnv("DB_PORT");
  const user = requiredEnv("DB_USERNAME");
  const password = requiredEnv("DB_PASSWORD");
  const database = requiredEnv("DB_NAME");

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function main() {
  process.env.DATABASE_URL = buildDatabaseUrl();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    throw new Error("No Prisma command provided.");
  }

  const child = spawn("npx", ["prisma", ...args], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  child.on("exit", (code) => process.exit(code ?? 1));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Failed to run Prisma command.");
  console.error(message);
  process.exit(1);
});

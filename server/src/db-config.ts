import "dotenv/config";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDatabaseUrl(): string {
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

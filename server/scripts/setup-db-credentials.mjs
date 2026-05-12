import mysql from "mysql2/promise";

function required(value, name) {
  if (!value) {
    throw new Error(`Missing required value: ${name}`);
  }
  return value;
}

function escapeId(identifier) {
  return `\`${identifier.replace(/`/g, "``")}\``;
}

function escapeStr(value) {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

async function main() {
  const host = process.env.MYSQL_HOST ?? "localhost";
  const port = Number(process.env.MYSQL_PORT ?? "3306");
  const socketPath = process.env.MYSQL_SOCKET_PATH;
  const adminUser = process.env.MYSQL_ADMIN_USER ?? "root";
  const adminPassword = process.env.MYSQL_ADMIN_PASSWORD ?? "";
  const database = process.env.DB_NAME ?? process.env.MYSQL_DATABASE ?? "simple_counter";
  const appUser = process.env.DB_USERNAME ?? process.env.MYSQL_APP_USER ?? "counter_user";
  const appPassword = required(
    process.env.DB_PASSWORD ?? process.env.MYSQL_APP_PASSWORD ?? "counter_pass",
    "DB_PASSWORD"
  );
  const appHost = process.env.DB_USER_HOST ?? process.env.MYSQL_APP_HOST ?? "localhost";

  const connectionConfig = socketPath
    ? {
        socketPath,
        user: adminUser,
        password: adminPassword,
      }
    : {
        host,
        port,
        user: adminUser,
        password: adminPassword,
      };

  const connection = await mysql.createConnection(connectionConfig);

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${escapeId(database)}`);
    await connection.query(
      `CREATE USER IF NOT EXISTS ${escapeStr(appUser)}@${escapeStr(appHost)} IDENTIFIED BY ${escapeStr(appPassword)}`
    );
    await connection.query(
      `ALTER USER ${escapeStr(appUser)}@${escapeStr(appHost)} IDENTIFIED BY ${escapeStr(appPassword)}`
    );
    await connection.query(
      `GRANT ALL PRIVILEGES ON ${escapeId(database)}.* TO ${escapeStr(appUser)}@${escapeStr(appHost)}`
    );
    await connection.query("FLUSH PRIVILEGES");

    console.log("Database credentials set up successfully.");
    console.log("Set these values in server/.env:");
    console.log(`DB_HOST=${host}`);
    console.log(`DB_PORT=${port}`);
    console.log(`DB_USERNAME=${appUser}`);
    console.log(`DB_PASSWORD=${appPassword}`);
    console.log(`DB_NAME=${database}`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Failed to create DB credentials.");
  console.error(
    "Check MYSQL_ADMIN_USER / MYSQL_ADMIN_PASSWORD and ensure this admin user can create users/databases."
  );
  console.error(
    "If your MySQL root user uses socket auth, run with MYSQL_SOCKET_PATH (example: /tmp/mysql.sock)."
  );
  console.error(message);
  process.exit(1);
});

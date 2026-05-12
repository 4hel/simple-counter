# simple-counter

Monorepo mit:

- `server`: Express + Prisma + MySQL
- `client`: Vue 3 + TypeScript

## Voraussetzungen

- Node.js 20+
- Laufende MySQL-Datenbank

## Hinweis zu MariaDB

- `mariadb` und `mysql` CLI koennen sich lokal unterschiedlich verhalten (z. B. anderer Socket oder andere Defaults).
- Wenn `mariadb` funktioniert, `mysql` aber `Access denied` zeigt, ist das oft ein lokales Auth-/Socket-Thema und kein Prisma-Problem.
- Fuer dieses Projekt ist nur wichtig, dass die Zugangsdaten aus `server/.env` funktionieren (`npm run db:test` prueft das direkt).
- Bei MariaDB ist ein eigener App-User empfohlen (z. B. `counter_user`) statt `root`.

## Start

1. Abhaengigkeiten installieren:

   ```bash
   npm install
   ```

2. Umgebungsvariablen aus den Beispiel-Dateien erstellen:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Optional: DB, User und Rechte automatisch anlegen (mit Admin-User):

   Copy/Paste (mit echten Werten, keine Platzhalter):

   ```bash
   MYSQL_ADMIN_USER=counter_admin MYSQL_ADMIN_PASSWORD='DEIN_ECHTES_PASSWORT' npm run db:setup-credentials
   ```

   Falls dein root-Login ueber Socket-Auth laeuft:

   ```bash
   MYSQL_ADMIN_USER=root MYSQL_SOCKET_PATH=/tmp/mysql.sock npm run db:setup-credentials
   ```

   Hinweis:
   - Der Befehl muss in einer normalen Shell gestartet werden (nicht mit Platzhaltern wie `dein_passwort`).
   - Wenn `Access denied` kommt, zuerst den Login pruefen:

   ```bash
   mariadb -u counter_admin -p
   ```

   - Erst wenn der Login dort klappt, funktioniert auch `npm run db:setup-credentials`.

   Optionale Parameter:
   - `MYSQL_HOST` (default: `localhost`)
   - `MYSQL_PORT` (default: `3306`)
   - `MYSQL_SOCKET_PATH` (optional, z. B. `/tmp/mysql.sock`)
   - `DB_NAME` (default: `simple_counter`)
   - `DB_USERNAME` (default: `counter_user`)
   - `DB_PASSWORD` (default: `counter_pass`)
   - `DB_USER_HOST` (default: `localhost`)

4. Alternative (manuell mit MariaDB): erst in die MariaDB-Shell wechseln und dann DB/User anlegen:

   ```bash
   mariadb -u root -p
   ```

   Danach in der SQL-Shell:

   ```sql
   CREATE DATABASE IF NOT EXISTS simple_counter;
   CREATE USER IF NOT EXISTS 'counter_user'@'localhost' IDENTIFIED BY 'counter_pass';
   GRANT ALL PRIVILEGES ON simple_counter.* TO 'counter_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. MySQL-Datenbank bereitstellen (z. B. lokal) und Verbindungsdaten in `server/.env` setzen:

   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=counter_user
   DB_PASSWORD=counter_pass
   DB_NAME=simple_counter
   ```

6. Datenbank-Verbindung testen:

   ```bash
   npm run db:test
   ```

7. Prisma Migration ausfuehren:

   ```bash
   npm run prisma:migrate
   ```

   Alternativ fuer schnelles lokales Schema-Update ohne Migrationsdateien:

   ```bash
   npm run prisma:push
   ```

8. Frontend + Backend starten:

   ```bash
   npm run dev
   ```

Danach:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api/counter`

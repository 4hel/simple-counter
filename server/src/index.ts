import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./db-config.js";

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

async function ensureCounterExists() {
  const counter = await prisma.counter.findUnique({ where: { id: 1 } });
  if (!counter) {
    await prisma.counter.create({
      data: {
        id: 1,
        value: 0,
      },
    });
  }
}

app.get("/api/counter", async (_req, res) => {
  await ensureCounterExists();
  const counter = await prisma.counter.findUniqueOrThrow({ where: { id: 1 } });
  res.json({ value: counter.value });
});

app.post("/api/counter/increment", async (_req, res) => {
  await ensureCounterExists();
  const counter = await prisma.counter.update({
    where: { id: 1 },
    data: { value: { increment: 1 } },
  });
  res.json({ value: counter.value });
});

app.post("/api/counter/decrement", async (_req, res) => {
  await ensureCounterExists();
  const counter = await prisma.counter.update({
    where: { id: 1 },
    data: { value: { decrement: 1 } },
  });
  res.json({ value: counter.value });
});

const staticDirEnv = process.env.STATIC_DIR?.trim();
if (staticDirEnv) {
  const staticDir = path.resolve(process.cwd(), staticDirEnv);
  const indexHtml = path.join(staticDir, "index.html");

  if (!fs.existsSync(indexHtml)) {
    console.warn(
      `STATIC_DIR is set to "${staticDir}", but no index.html was found there - skipping static file serving.`,
    );
  } else {
    app.use(express.static(staticDir));

    // SPA fallback: every non-API GET request returns index.html
    // so client-side routing and page reloads keep working.
    app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
      res.sendFile(indexHtml);
    });

    console.log(`Serving static files from ${staticDir}`);
  }
}

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

import "server-only";

import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";
import { SCHEMA_SQL, TRIGGER_SQL } from "./sql";

const globalForDb = globalThis as unknown as { kaspahDb?: Promise<any> };

export function getDb(): Promise<any> {
  if (!globalForDb.kaspahDb) {
    globalForDb.kaspahDb = open().catch((error: unknown) => {
      globalForDb.kaspahDb = undefined;
      throw error;
    });
  }
  return globalForDb.kaspahDb;
}

async function open() {
  const url = process.env.DATABASE_URL;
  const postgresUrl = url && /^postgres(?:ql)?:\/\//.test(url) ? url : undefined;
  if (url && !postgresUrl && process.env.NODE_ENV !== "production") {
    console.warn("DATABASE_URL is not a Postgres URL, so the local database is being used.");
  }
  if (postgresUrl) {
    const postgres = (await import("postgres")).default;
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const sql = postgres(postgresUrl, { max: 5 });
    await sql.unsafe(SCHEMA_SQL);
    try {
      await sql.unsafe(TRIGGER_SQL);
    } catch (error) {
      console.error("Selection country trigger was not installed.", error);
    }
    const db = drizzle(sql, { schema });
    await seedIfEmpty(db);
    return db;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const dataDir = path.join(process.cwd(), ".data", "kaspah");
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const client = new PGlite(dataDir);
  await client.waitReady;
  await client.exec(SCHEMA_SQL);
  try {
    await client.exec(TRIGGER_SQL);
  } catch (error) {
    console.error("Selection country trigger was not installed.", error);
  }
  const db = drizzle({ client, schema });
  await seedIfEmpty(db);
  return db;
}

import * as schema from "@shared/schema";
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("[DB] ERROR: DATABASE_URL environment variable not set!");
  console.error("[DB] On Railway, add DATABASE_URL in Variables tab");
  console.error("[DB] Current env keys:", Object.keys(process.env).filter(k => k.includes('DB') || k.includes('PG')));
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("[DB] Connecting to database...");

// Use regular PostgreSQL Pool - works with both Neon and Railway
const pool = new Pool({
  connectionString: databaseUrl,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('[DB] Successfully connected to database');
});

export const db = drizzle({ client: pool, schema });

import { Pool } from "pg";

declare global {
  var sampleAppPool: Pool | undefined;
}

const globalForPool = globalThis as typeof globalThis & {
  sampleAppPool?: Pool;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  return databaseUrl;
}

export function getPool() {
  if (!globalForPool.sampleAppPool) {
    globalForPool.sampleAppPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return globalForPool.sampleAppPool;
}

import { drizzle } from "drizzle-orm/node-postgres";

import { getPool } from "./pool";
import * as schema from "./schema";

const makeDb = () =>
  drizzle({
    client: getPool(),
    schema,
  });

type Database = ReturnType<typeof makeDb>;

declare global {
  var sampleAppDb: Database | undefined;
}

const globalForDb = globalThis as typeof globalThis & {
  sampleAppDb?: Database;
};

export function getDb() {
  if (!globalForDb.sampleAppDb) {
    globalForDb.sampleAppDb = makeDb();
  }

  return globalForDb.sampleAppDb;
}

export const db = getDb();

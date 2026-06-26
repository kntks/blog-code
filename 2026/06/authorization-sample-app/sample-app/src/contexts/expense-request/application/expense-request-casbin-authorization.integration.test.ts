import assert from "node:assert/strict";
import test from "node:test";

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";

import { createActor } from "../test-fixtures.ts";
import { casbinExpenseRequestAuthorization } from "./expense-request-casbin-authorization.ts";

const databaseUrl = process.env.DATABASE_URL;

test(
  "casbin authorization integration: loadPolicy() で DB seed policy を読み込める",
  { skip: !databaseUrl },
  async () => {
    const { getPool } = await import("../../../shared/db/pool.ts");
    const db = drizzle({
      client: getPool(),
    });

    await migrate(db, {
      migrationsFolder: `${process.cwd()}/drizzle`,
    });

    const allowed = await casbinExpenseRequestAuthorization.authorize({
      actor: createActor({ role: "member" }),
      action: "create",
    });

    assert.equal(allowed, true);
  },
);

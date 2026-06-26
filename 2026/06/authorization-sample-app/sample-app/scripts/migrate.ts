import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "../src/shared/db/client.js";

try {
  console.log("🚀 Starting database migration...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migration completed successfully!");
  process.exit(0);
} catch (error) {
  console.error("❌ Migration failed:");
  console.error(error);
  process.exit(1);
}

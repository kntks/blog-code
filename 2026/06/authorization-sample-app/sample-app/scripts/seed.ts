import { departmentsTable } from "../src/contexts/identity/infrastructure/schema.js";
import { db } from "../src/shared/db/client.js";

try {
  console.log("Starting database seed...");

  await db
    .insert(departmentsTable)
    .values({
      id: "dept-general",
      code: "general",
      name: "General",
    })
    .onConflictDoNothing({ target: departmentsTable.id });

  console.log("Database seed completed successfully.");
  process.exit(0);
} catch (error) {
  console.error("Database seed failed:");
  console.error(error);
  process.exit(1);
}

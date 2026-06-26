import { db } from "./db";

async function main() {
  const result = await db.execute("SELECT 1 + 1 AS result");
  console.log(result.rows[0].result); // Should print 2
}

main()
  .catch((error) => {
    console.error("Error executing query:", error);
  })
  .finally(() => db.$client.end());

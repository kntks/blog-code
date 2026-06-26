import { sessions } from "@/shared/db/schema";

import { db } from "./db";
async function main() {
  const result = await db.select().from(sessions);
  console.log(result);
}

main()
  .catch((error) => {
    console.error("Error executing query:", error);
  })
  .finally(() => db.$client.end());

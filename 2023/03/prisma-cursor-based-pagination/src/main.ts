import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

prisma.$on("query", (e) => {
  console.log(e.query);
});

async function createPosts() {
  await prisma.$transaction(
    [...Array(20)].map((_, i) => {
      return prisma.posts.upsert({
        where: { id: i + 1 },
        update: {},
        create: { id: i + 1, title: `title${i + 1}` },
      });
    })
  );
}

async function findMany() {
  return await prisma.posts.findMany({
    take: -5,
    skip: 1,
    cursor: {
      id: 11,
    },
    orderBy: [{ id: "asc" }],
  });
}

async function main() {
  // await createPosts();

  const results = await findMany();
  console.log(results);
}

async function resetTables(tableNames: string[]): Promise<void> {
  const transactions: Prisma.PrismaPromise<any>[] = [];
  transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`);
  transactions.push(
    ...tableNames.map((name) =>
      prisma.$executeRawUnsafe(`TRUNCATE TABLE ${name}`)
    )
  );
  transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);

  try {
    await prisma.$transaction(transactions);
  } catch (error) {
    console.log({ error });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

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
  await prisma.posts.create({
    data: {
      url: "https://xxxxx",
      title: "example",
      PostTags: {
        connectOrCreate: [
          {
            where: {
              postId_tagId: {
                postId: 1,
                tagId: 1,
              },
            },
            create: {
              tag: {
                create: {
                  name: "tag1",
                },
              },
            },
          },
          {
            where: {
              postId_tagId: {
                postId: 1,
                tagId: 2,
              },
            },
            create: {
              tag: {
                create: {
                  name: "tag2",
                },
              },
            },
          },
        ],
      },
    },
  });
}

async function upsertPostTags(postId: number, tagIds: number[]) {
  await prisma.posts.update({
    where: { id: postId },
    data: {
      PostTags: {
        upsert: tagIds.map((tagId) => ({
          where: { postId_tagId: { postId, tagId } },
          create: { tag: { create: { id: tagId, name: `tag${tagId}` } } },
          update: { tag: { connect: { id: tagId } } },
        })),
        deleteMany: {
          // NOT: tagIds.map((tagId) => ({ tagId })),
          tagId: {
            notIn: tagIds,
          },
        },
      },
    },
  });
}

async function resetTable(tableNames: string[]) {
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

async function main() {
  // await createPosts();
  await upsertPostTags(1, [1, 4]);
  // await resetTable(["tags", "posts", "PostTags"])
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

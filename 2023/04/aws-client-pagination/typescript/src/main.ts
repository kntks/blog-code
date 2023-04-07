import { IAMClient, paginateListRoles } from "@aws-sdk/client-iam";

async function main() {
  const paginator = paginateListRoles(
    {
      client: new IAMClient({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
          sessionToken: process.env.AWS_SESSION_TOKEN || "",
        },
        region: "ap-northeast-1",
      }),
    },
    {
      PathPrefix: "/",
    }
  );

  for await (const p of paginator) {
    console.log(p.Roles);
  }
}

main().catch((e) => console.error(e));

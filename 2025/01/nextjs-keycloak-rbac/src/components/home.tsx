import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { AdminButton, EditButton, LogoutButton } from "./button";

export const Home: React.FC = async () => {
  const session = await auth();
  if (!session) redirect("/");
  const { user } = session;

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>ようこそ</CardTitle>
        <CardDescription>
          {user.name}さん、ログインに成功しました！
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>メールアドレス: {user.email}</p>
        <p>ユーザー情報:</p>
        <pre className="mt-2 w-[450px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(user, null, 2)}</code>
        </pre>
      </CardContent>
      <CardFooter className="flex justify-between">
        {user.roles.includes("admin") && <AdminButton />}
        {user.roles.includes("editor") && <EditButton />}
        <LogoutButton />
      </CardFooter>
    </Card>
  );
};

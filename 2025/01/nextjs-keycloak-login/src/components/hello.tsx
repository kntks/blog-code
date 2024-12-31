import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "./button";

export const Hello: React.FC = async () => {
  const session = await auth();

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>ようこそ</CardTitle>
        <CardDescription>
          {session?.user?.name}さん、ログインに成功しました！
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>メールアドレス: {session?.user?.email}</p>
        <p>ユーザー情報:</p>
        <pre className="mt-2 w-[450px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify(session?.user, null, 2)}
          </code>
        </pre>
      </CardContent>
      <CardFooter className="flex justify-between">
        <LogoutButton />
      </CardFooter>
    </Card>
  );
};

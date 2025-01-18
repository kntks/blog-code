import { signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const LoginButton: React.FC = () => {
  return (
    <Button
      onClick={async () => {
        "use server";
        await signIn("keycloak", { redirectTo: "/home" });
      }}
    >
      Keyclokでログイン
    </Button>
  );
};

export const LogoutButton: React.FC = () => {
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      ログアウト
    </Button>
  );
};

export const AdminButton: React.FC = () => {
  return (
    <Button variant="secondary">
      <Link href="/admin">Admin</Link>
    </Button>
  );
};

export const EditButton: React.FC = () => {
  return (
    <Button variant="secondary">
      <Link href="/edit">編集</Link>
    </Button>
  );
};

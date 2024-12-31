import { signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export const LoginButton: React.FC = () => {
  return (
    <Button
      onClick={async () => {
        "use server";
        await signIn("keycloak", { redirectTo: "/hello" });
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

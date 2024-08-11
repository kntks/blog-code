import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { adminAuth } from "~/firebase.server";
import { getSession } from "~/sessions";
import { FirebaseAuthError } from "firebase-admin/auth";

export const loader = async ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  if (url.pathname === "/login") return {}

  const sessionCookie = await getSession(request.headers.get("Cookie"));
  if(!sessionCookie.has("token")) return redirect("/login")

  const token = sessionCookie.get("token")
  if (!token || typeof token !== "string") {
    return redirect("/login");
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(token)
    return json({ name: decodedToken.name })
  } catch (error) {

    // 検証に失敗した場合はログイン画面にリダイレクト
    if(error instanceof FirebaseAuthError) {
      console.error(error.code, error.message);
      throw redirect("/login");
    }
    throw error;
  }
} 

export function Layout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

import {  signInWithGoogle } from "~/firebase";
import { commitSession, getSession } from "~/sessions";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { adminAuth } from "~/firebase.server"
import { useSubmit } from "@remix-run/react";


export const action = async ({request}: ActionFunctionArgs) => {
  const idToken = await request.formData().then(d => d.get("idToken"));

  if (!idToken || typeof idToken !== "string") {
    return redirect("/login");
  }

  // idTokenを検証
  await adminAuth.verifyIdToken(idToken).catch(() => redirect("/login"));

  // セッションを作成
  const sess = await adminAuth.createSessionCookie(idToken, {expiresIn: 1000 * 60 * 60 * 24 * 14});

  const session = await getSession(request.headers.get("Cookie"));
  session.set("token", sess);
  return redirect("/home", { headers: {"Set-Cookie": await commitSession(session)} });
}


export default function Login() {
  const submit = useSubmit();
  const handleLogin = async () => {
    const credential = await signInWithGoogle();
    if (!credential) {
      console.error("Login failed");
      return
    }

    submit({"idToken": credential || null}, {method: "post"});
  }

  return (
    <div>
      <h1>ログイン</h1>
      <button 
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
        onClick={handleLogin}
      >Googleでログイン
      </button>
    </div>
  );
}
import { createCookieSessionStorage } from "@remix-run/node";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: ["jYgJecKA63HAx"],
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 14, // 2 week
      sameSite: "lax",
      path: "/",
      httpOnly: true,
    },
  });
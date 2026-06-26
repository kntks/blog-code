import { NextMiddlewareResult } from "next/dist/server/web/types";
import { headers } from "next/headers";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/shared/auth/server";

const PUBLIC_PATHS = ["/", "/login"];

export async function proxy(
  request: NextRequest,
  _event: NextFetchEvent,
): Promise<NextMiddlewareResult> {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

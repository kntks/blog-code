import { auth } from "@/auth";
import {
  type MiddlewareConfig,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
  NextResponse,
} from "next/server";

type NextAuthMiddleware = typeof auth;

// ref: https://github.com/nextauthjs/next-auth/discussions/8961#discussioncomment-9625060
function compose(
  ...fns: (NextAuthMiddleware | NextMiddleware)[]
): NextMiddleware {
  const validMiddlewares = fns.filter((fn) => typeof fn === "function");

  return async (req: NextRequest, event: NextFetchEvent) => {
    for (const fn of validMiddlewares) {
      const response = await fn(req, event);
      if (response instanceof NextResponse || response instanceof Response)
        return response;
    }
    return NextResponse.next();
  };
}

function log(req: NextRequest, _event: NextFetchEvent) {
  // 別のミドルウェアを呼び出す
  console.log("request path", req.nextUrl.pathname);
}

const middlewares: NextMiddleware[] = [log, auth];

export default compose(...middlewares);

export const config = {
  matcher: [
    "/((?!api/auth|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
} satisfies MiddlewareConfig;

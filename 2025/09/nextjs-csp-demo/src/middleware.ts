import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // /secure パスのみCSPヘッダーを適用
  if (request.nextUrl.pathname.includes('/secure')) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
      style-src 'self' 'nonce-${nonce}';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `
    // Replace newline characters and spaces
    const contentSecurityPolicyHeaderValue = cspHeader
      .replace(/\s{2,}/g, ' ')
      .trim()

    // x-nonce ヘッダーを追加することで、Next.js は
    // 自動で script タグに nonce を設定する
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)

    // Next.js Server からのレスポンスに CSP ヘッダーを追加し
    // ブラウザに送信
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
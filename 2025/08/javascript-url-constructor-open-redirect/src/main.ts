/**
 * 絶対パスのcallbackURLを安全にバリデーションする関数
 * @param nextUrl リクエストURL
 * @returns 安全な絶対URLまたはnull
 */
export function extractCallbackUrl(nextUrl: URL): string | null {
  const callbackUrl = nextUrl.searchParams.get("callbackUrl")
  if (!callbackUrl) return null;

  // URLエンコード攻撃の検出（デコード前にチェック）
  const suspiciousPatterns = [
    /%2f/i,    // エンコードされたスラッシュ
    /%5c/i,    // エンコードされたバックスラッシュ
    /%2e/i,    // エンコードされたドット
    /%40/i,    // エンコードされた@
    /%3a/i,    // エンコードされたコロン（プロトコル区切り）
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(callbackUrl)) {
      return null;
    }
  }

  const decodedCallbackUrl = decodeURIComponent(callbackUrl)

  // 空文字列や空白のみの場合は拒否
  if (decodedCallbackUrl.trim() === "") {
    return null;
  }

  // 長すぎるパスを拒否（DoS攻撃防止）
  if (decodedCallbackUrl.length > 2048) {
    return null;
  }

  // ヌルバイト攻撃の防止
  if (decodedCallbackUrl.includes("\0") || decodedCallbackUrl.includes("%00")) {
    return null;
  }

  // Unicode制御文字の防止
  if (/[\u0000-\u001F\u007F-\u009F]/.test(decodedCallbackUrl)) {
    return null;
  }

  // バックスラッシュを含むパスを拒否（Windows形式のパス攻撃対策）
  if (decodedCallbackUrl.includes("\\")) {
    return null;
  }

  // ネットワークパス（プロトコル相対URL）攻撃の防止（//で始まる）
  if (decodedCallbackUrl.startsWith("//")) {
    return null;
  }

  // 不正なプロトコル開始パターンの防止
  if (decodedCallbackUrl.startsWith("://")) {
    return null;
  }

  // パストラバーサル攻撃の防止
  if (decodedCallbackUrl.includes("..")) {
    return null;
  }

  // ユーザー情報（@記号）を含むURLを拒否
  if (decodedCallbackUrl.includes("@")) {
    return null;
  }

  // 危険なプロトコルの防止
  const dangerousProtocols = [
    'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:', 
    'mailto:', 'tel:', 'sms:', 'callto:', 'chrome:', 
    'chrome-extension:', 'moz-extension:'
  ];
  
  const lowerCaseUrl = decodedCallbackUrl.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerCaseUrl.startsWith(protocol)) {
      return null;
    }
  }

  // IPアドレス（プライベートIP含む）への直接アクセスを防止
  const ipPatterns = [
    /^https?:\/\/127\./,           // ローカルホスト
    /^https?:\/\/localhost/,       // localhost
    /^https?:\/\/\[::1\]/,         // IPv6ローカルホスト
    /^https?:\/\/10\./,            // RFC1918 プライベートIP
    /^https?:\/\/192\.168\./,      // RFC1918 プライベートIP
    /^https?:\/\/172\.(1[6-9]|2[0-9]|3[01])\./,  // RFC1918 プライベートIP
    /^https?:\/\/169\.254\./,      // リンクローカル
    /^https?:\/\/0\./,             // 0.x.x.x
    /^https?:\/\/\d+\.\d+\.\d+\.\d+/  // 一般的なIPアドレス形式
  ];

  for (const pattern of ipPatterns) {
    if (pattern.test(lowerCaseUrl)) {
      return null;
    }
  }

  // URLエンコード攻撃の検出は既に上部で実行済み

  try {
    const url = new URL(decodedCallbackUrl, nextUrl.origin);
    
    // オリジンの厳密なチェック
    if (url.origin !== nextUrl.origin) {
      return null;
    }

    // ポート番号の検証（標準ポート以外は要注意）
    if (url.port && url.port !== '' && 
        !['80', '443'].includes(url.port) && 
        url.port !== nextUrl.port) {
      return null;
    }

    // プロトコルの検証
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    // ホスト名の厳密な検証
    if (url.hostname !== nextUrl.hostname) {
      return null;
    }

  } catch {
    return null;
  }

  return decodedCallbackUrl;
}

/**
 * 相対パスのcallbackURLを安全にバリデーションする関数
 * @param nextUrl リクエストURL
 * @returns 安全な相対パスまたはnull
 */
export function extractRelativeCallbackUrl(nextUrl: URL): string | null {
  const callbackUrl = nextUrl.searchParams.get("callbackUrl")
  if (!callbackUrl) return null;

  // URLエンコード攻撃の検出（デコード前にチェック）
  // 主に危険なパターンの組み合わせを検出
  const suspiciousPatterns = [
    /%2e%2e/i,    // エンコードされた..（パストラバーサル）
    /%2f%2f/i,    // エンコードされた//（プロトコル相対URL）
    /%5c%5c/i,    // エンコードされた\\（UNCパス）
    /%00/i,       // エンコードされたヌルバイト
    /%40.*\./i,   // エンコードされた@とドメイン形式
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(callbackUrl)) {
      return null;
    }
  }

  const decodedCallbackUrl = decodeURIComponent(callbackUrl)

  // 絶対URLかどうかをチェック（プロトコルが含まれている場合は拒否）
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decodedCallbackUrl)) {
    return null;
  }

  // ネットワークパス（プロトコル相対URL）（//で始まる）を拒否
  if (decodedCallbackUrl.startsWith("//")) {
    return null;
  }

  // バックスラッシュを含むパスを拒否（Windows形式のパス攻撃対策）
  if (decodedCallbackUrl.includes("\\")) {
    return null;
  }

  // パストラバーサル攻撃の防止
  if (decodedCallbackUrl.includes("..")) {
    return null;
  }

  // ユーザー情報（@記号）を含むURLを拒否
  if (decodedCallbackUrl.includes("@")) {
    return null;
  }

  // ヌルバイト攻撃の防止
  if (decodedCallbackUrl.includes("\0") || decodedCallbackUrl.includes("%00")) {
    return null;
  }

  // Unicode制御文字の防止
  if (/[\u0000-\u001F\u007F-\u009F]/.test(decodedCallbackUrl)) {
    return null;
  }

  // 相対パスは必ず / で始まるか、文字で始まることを確認
  if (!decodedCallbackUrl.startsWith("/") && !/^[a-zA-Z0-9]/.test(decodedCallbackUrl)) {
    return null;
  }

  // 空文字列や空白のみの場合は拒否
  if (decodedCallbackUrl.trim() === "") {
    return null;
  }

  // 長すぎるパスを拒否（DoS攻撃防止）
  if (decodedCallbackUrl.length > 2048) {
    return null;
  }

  // URL構築テストで相対パスとして正しく解釈されるかチェック
  try {
    const testUrl = new URL(decodedCallbackUrl, nextUrl.origin);
    // 構築されたURLのoriginが同じかチェック
    if (testUrl.origin !== nextUrl.origin) {
      return null;
    }
  } catch {
    return null;
  }

  return decodedCallbackUrl;
}

// 許可されたパスのリスト（allowlist方式）
const ALLOWED_PATHS = [
  '/protected',
  '/dashboard',
  '/profile',
  '/settings'
];

/**
 * 許可リスト方式で相対パスのcallbackURLを安全にバリデーションする関数
 * @param nextUrl リクエストURL
 * @param allowedPaths 許可されたパスのリスト（オプション、デフォルトは定義済みリスト）
 * @returns 安全な相対パスまたはnull
 */
export function extractAllowedCallbackUrl(
  nextUrl: URL, 
  allowedPaths: string[] = ALLOWED_PATHS
): string | null {
  const callbackUrl = nextUrl.searchParams.get("callbackUrl")
  if (!callbackUrl) return null;

  const decodedCallbackUrl = decodeURIComponent(callbackUrl).trim();

  // 空文字列チェック
  if (decodedCallbackUrl === "") {
    return null;
  }

  // 許可リストとの完全一致チェック
  if (allowedPaths.includes(decodedCallbackUrl)) {
    return decodedCallbackUrl;
  }

  // クエリパラメータやフラグメント付きの許可されたパスをチェック
  for (const allowedPath of allowedPaths) {
    if (decodedCallbackUrl.startsWith(allowedPath)) {
      // 許可されたパスの後に続くのは ? (クエリ) または # (フラグメント) のみ
      const remaining = decodedCallbackUrl.slice(allowedPath.length);
      if (remaining === '' || remaining.startsWith('?') || remaining.startsWith('#')) {
        return decodedCallbackUrl;
      }
    }
  }

  return null;
}

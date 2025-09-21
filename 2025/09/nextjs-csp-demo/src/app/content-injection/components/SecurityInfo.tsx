import React from 'react';

interface SecurityInfoProps {
  isSecure: boolean;
}

export default function SecurityInfo({ isSecure }: SecurityInfoProps) {
  if (isSecure) {
    return (
      <>
        <div className="border rounded-lg p-6 bg-emerald-50">
          <h3 className="text-lg font-semibold mb-4 text-emerald-800">✅ 安全な実装パターン</h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-green-300 rounded bg-white">
              <h4 className="font-medium text-green-800 mb-2">1. HTML サニタイゼーション</h4>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-red-700 font-medium">❌ 危険</div>
                    <div className="bg-red-100 p-2 rounded font-mono text-xs">
                      dangerouslySetInnerHTML
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700 font-medium">✅ 安全</div>
                    <div className="bg-green-100 p-2 rounded font-mono text-xs">
                      DOMPurify.sanitize(html)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-blue-300 rounded bg-white">
              <h4 className="font-medium text-blue-800 mb-2">2. CSS の安全な処理</h4>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-red-700 font-medium">❌ 危険</div>
                    <div className="bg-red-100 p-2 rounded font-mono text-xs">
                      element.style = userCSS
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700 font-medium">✅ 安全</div>
                    <div className="bg-green-100 p-2 rounded font-mono text-xs">
                      predefinedStyles[userChoice]
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-purple-300 rounded bg-white">
              <h4 className="font-medium text-purple-800 mb-2">3. コンテンツの安全な表示</h4>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-red-700 font-medium">❌ 危険</div>
                    <div className="bg-red-100 p-2 rounded font-mono text-xs">
                      innerHTML = userContent
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700 font-medium">✅ 安全</div>
                    <div className="bg-green-100 p-2 rounded font-mono text-xs">
                      textContent = userContent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🛡️ CSPによる包括的保護：</h3>
          <ul className="text-green-700 space-y-1 list-disc list-inside">
            <li><code>script-src 'self'</code> - 悪意のあるスクリプト実行をブロック</li>
            <li><code>style-src 'self' 'unsafe-inline'</code> - 危険なCSS実行を制限</li>
            <li><code>img-src 'self' data: https:</code> - 安全な画像のみ許可</li>
            <li><code>frame-src 'none'</code> - iframe埋め込みを禁止</li>
            <li><code>object-src 'none'</code> - オブジェクト埋め込みを禁止</li>
            <li><code>base-uri 'self'</code> - ベースURI変更を防止</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Defense in Depth（多層防御）：</h3>
          <ul className="text-blue-700 space-y-1 list-disc list-inside">
            <li>CSP + 入力値検証の組み合わせ</li>
            <li>HTMLサニタイザー（DOMPurify等）との併用</li>
            <li>定期的なセキュリティ監査の実施</li>
            <li>CSP違反レポートの監視・分析</li>
            <li>最新のセキュリティベストプラクティスの適用</li>
          </ul>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">⚠️ この実装の問題点：</h3>
        <ul className="text-red-700 space-y-1 list-disc list-inside">
          <li>ユーザー入力を一切サニタイズせずにDOM に挿入</li>
          <li>dangerouslySetInnerHTML の不適切な使用</li>
          <li>CSS、メタタグの制限なし</li>
          <li>Data URL や javascript: スキームを制限していない</li>
          <li>Content Security Policy が未設定</li>
          <li>DOM Clobbering への対策なし</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">🔍 攻撃の確認方法：</h3>
        <ul className="text-blue-700 space-y-1 list-disc list-inside">
          <li>ブラウザ開発者ツールのElements タブで注入されたHTML を確認</li>
          <li>Console タブでスクリプトの実行状況を監視</li>
          <li>Network タブで不正な外部通信を検出</li>
          <li>Application タブでCookie やストレージの改竄を確認</li>
        </ul>
      </div>
    </>
  );
}

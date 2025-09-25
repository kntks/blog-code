import React from 'react';

interface UserInputSectionProps {
  userComment: string;
  setUserComment: (value: string) => void;
  userStyle: string;
  setUserStyle: (value: string) => void;
  userMeta: string;
  setUserMeta: (value: string) => void;
  isSecure: boolean;
}

export default function UserInputSection({
  userComment,
  setUserComment,
  userStyle,
  setUserStyle,
  userMeta,
  setUserMeta,
  isSecure
}: UserInputSectionProps) {
  const borderColor = isSecure ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50';
  const titleColor = isSecure ? 'text-green-800' : 'text-yellow-800';
  const textColor = isSecure ? 'text-green-700' : 'text-yellow-700';

  return (
    <div className={`${borderColor} border rounded-lg p-4`}>
      <h3 className={`font-semibold ${titleColor} mb-2`}>
        {isSecure ? 'CSP保護のテスト：' : 'コンテンツインジェクション攻撃とは：'}
      </h3>
      <p className={`${textColor} mb-4`}>
        {isSecure 
          ? '同じ攻撃コードでも、CSPにより安全に処理されるかブロックされます：'
          : '悪意のあるHTMLコンテンツ、CSS、JavaScript、メタタグなどを正当なWebページに注入する攻撃です。CSPにより、これらの不正な要素の実行や読み込みを制限することができます。'
        }
      </p>
      
      <div className={`${isSecure ? 'bg-blue-100' : 'bg-red-100'} p-3 rounded text-sm`}>
        <strong>{isSecure ? '🔒 保護される攻撃タイプ：' : '⚠️ 攻撃の種類：'}</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {isSecure ? (
            <>
              <li><code>script-src</code> - 悪意のあるスクリプトの実行をブロック</li>
              <li><code>style-src</code> - 危険なCSS の実行をブロック</li>
              <li><code>img-src</code> - 不正な画像リソースをブロック</li>
              <li><code>frame-src</code> - Data URL iframe等をブロック</li>
              <li><code>object-src 'none'</code> - オブジェクト埋め込みを禁止</li>
            </>
          ) : (
            <>
              <li>HTML インジェクション - 悪意のあるHTML要素の挿入</li>
              <li>CSS インジェクション - スタイルを悪用したコード実行</li>
              <li>メタタグインジェクション - ページの動作を変更</li>
              <li>DOM Clobbering - 既存のDOM要素を上書き</li>
              <li>Data URL 注入 - data: スキームを悪用</li>
            </>
          )}
        </ul>
      </div>

      {!isSecure && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-orange-800 mb-2">攻撃コードの例：</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`<img src="x" onerror="alert('XSS!')">  // 画像エラーでスクリプト実行`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`<style>body{background:url("javascript:alert('CSS XSS')")}</style>`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`<meta http-equiv="refresh" content="0;url=https://evil.com">`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`<iframe src="data:text/html,<script>alert('Data URL')</script>"></iframe>`}
            </div>
          </div>
        </div>
      )}

      {isSecure && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-blue-800 mb-2">🧪 CSP保護のテスト：</h3>
          <p className="text-blue-700 mb-2">
            同じ攻撃コードでも、CSPにより安全に処理されるかブロックされます：
          </p>
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`<img onerror="...">  // イベントハンドラがブロック`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`javascript: URL  // CSPによりブロック`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`data: iframe  // frame-src設定によりブロック`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

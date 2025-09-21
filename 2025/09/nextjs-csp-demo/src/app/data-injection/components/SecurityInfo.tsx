import React from 'react';

interface SecurityInfoProps {
  isSecure: boolean;
}

export default function SecurityInfo({ isSecure }: SecurityInfoProps) {
  if (isSecure) {
    return (
      <>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🛡️ CSPによる保護内容：</h3>
          <ul className="text-green-700 space-y-1 list-disc list-inside">
            <li><code>script-src</code> に <code>'unsafe-eval'</code> が含まれていないため<code>eval()</code>をブロック</li>
            <li><code>Function()</code> コンストラクタもブロック</li>
            <li><code>setTimeout()</code> や <code>setInterval()</code> の文字列実行もブロック</li>
            <li>動的コード生成を防止</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 安全な実装方法：</h3>
          <div className="text-blue-700 space-y-2">
            <p>eval() の代わりに安全な方法を使用：</p>
            <div className="bg-gray-100 p-2 rounded text-sm font-mono">
              {`// 安全: JSON.parse()を使用`}<br />
              {`const data = JSON.parse(userInput);`}
            </div>
            <div className="bg-gray-100 p-2 rounded text-sm font-mono">
              {`// 安全: スキーマ検証ライブラリを使用`}<br />
              {`const data = joi.attempt(userInput, schema);`}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">⚠️ この実装の問題点：</h3>
        <ul className="text-red-700 space-y-1 list-disc list-inside">
          <li><code>eval()</code> を使用してユーザー入力を実行</li>
          <li>任意のJavaScriptコードが実行される</li>
          <li>Cookie やローカルストレージにアクセス可能</li>
          <li>DOM操作により画面を改竄される可能性</li>
          <li>CSPが設定されていないため制限がない</li>
        </ul>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-800 mb-2">🔍 ブラウザ開発者ツールで確認：</h3>
        <p className="text-orange-700">
          攻撃が実行されると、ブラウザのConsole タブに様々な情報が表示されます。
          実際のWebアプリケーションでは、この情報が攻撃者に送信される可能性があります。
        </p>
      </div>
    </>
  );
}

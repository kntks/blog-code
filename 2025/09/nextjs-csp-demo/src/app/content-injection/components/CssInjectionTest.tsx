import React from 'react';

interface CssInjectionTestProps {
  userStyle: string;
  setUserStyle: (value: string) => void;
  onInject: () => void;
  isSecure: boolean;
}

export default function CssInjectionTest({
  userStyle,
  setUserStyle,
  onInject,
  isSecure
}: CssInjectionTestProps) {
  const titleColor = isSecure ? 'text-blue-700' : 'text-orange-700';
  const buttonColor = isSecure ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600';

  return (
    <div className="border rounded-lg p-6">
      <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>
        {isSecure ? '🎨 セキュアなCSS 処理テスト' : '🎨 CSS インジェクションテスト'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ユーザー定義CSS：
        </label>
        <textarea
          value={userStyle}
          onChange={(e) => setUserStyle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          rows={3}
          placeholder={isSecure ? "危険なCSS コードを試してみてください" : undefined}
        />
      </div>
      
      <button
        onClick={onInject}
        className={`${buttonColor} text-white px-4 py-2 rounded`}
      >
        CSS注入{isSecure ? 'テスト' : '実行'}
      </button>
      
      <div className={`mt-4 p-3 ${isSecure ? 'bg-blue-100' : 'bg-orange-100'} rounded text-sm`}>
        <strong>{isSecure ? 'CSPによるCSS保護：' : 'CSS注入の危険性：'}</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {isSecure ? (
            <>
              <li><code>style-src 'self'</code> - 外部CSS の制限</li>
              <li><code>javascript:</code> URL の無効化</li>
              <li><code>expression()</code> の実行防止（IE対策）</li>
              <li>危険なCSS関数の制限</li>
            </>
          ) : (
            <>
              <li>javascript: URL による コード実行（古いブラウザ）</li>
              <li>expression() による コード実行（IE）</li>
              <li>ページレイアウトの改竄</li>
              <li>フィッシング攻撃のための見た目変更</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

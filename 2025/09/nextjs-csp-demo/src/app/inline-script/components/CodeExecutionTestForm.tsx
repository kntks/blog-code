'use client';

interface CodeExecutionTestFormProps {
  userCode: string;
  setUserCode: (code: string) => void;
  onEvalTest: () => void;
  onFunctionTest: () => void;
  onTimeoutTest: () => void;
  onInlineScriptTest: () => void;
  onSecureAlternativeTest?: () => void;
  isSecure: boolean;
}

export default function CodeExecutionTestForm({
  userCode,
  setUserCode,
  onEvalTest,
  onFunctionTest,
  onTimeoutTest,
  onInlineScriptTest,
  onSecureAlternativeTest,
  isSecure
}: CodeExecutionTestFormProps) {
  const titleColor = isSecure ? 'text-green-700' : 'text-red-700';
  const titleText = isSecure ? '🛡️ CSP保護下でのコード実行テスト' : '🚨 危険なコード実行テスト';
  const buttonColor = isSecure ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
  const secondaryButtonColor = isSecure ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-600 hover:bg-red-700';
  const infoText = isSecure 
    ? 'ℹ️ どのようなコードでもCSPによりブロックされます'
    : '';

  return (
    <div className="border rounded-lg p-6">
      <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>{titleText}</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isSecure ? 'テスト用JavaScriptコード：' : '実行するJavaScriptコード：'}
        </label>
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          rows={4}
          placeholder={isSecure ? "alert('XSS攻撃のテスト'); document.cookie" : "alert('XSS攻撃成功!');"}
        />
        {infoText && (
          <p className="text-sm text-green-600 mt-1">
            {infoText}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={onEvalTest}
          className={`${buttonColor} text-white px-4 py-2 rounded`}
        >
          eval() {isSecure ? 'テスト' : '実行'}
        </button>
        
        <button
          onClick={onFunctionTest}
          className={`${secondaryButtonColor} text-white px-4 py-2 rounded`}
        >
          Function() {isSecure ? 'テスト' : '実行'}
        </button>
        
        <button
          onClick={onTimeoutTest}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          setTimeout() {isSecure ? 'テスト' : '実行'}
        </button>
        
        <button
          onClick={onInlineScriptTest}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          {isSecure ? 'インライン注入テスト' : 'インライン注入'}
        </button>
      </div>
      
      {isSecure && onSecureAlternativeTest && (
        <button
          onClick={onSecureAlternativeTest}
          className="w-full bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 mb-4"
        >
          ✅ 安全な代替手段のデモ
        </button>
      )}

      <div className={`p-3 rounded text-sm ${isSecure ? 'bg-green-100' : 'bg-red-100'}`}>
        <strong>{isSecure ? 'CSPによる保護効果：' : 'これらの実行方法が危険な理由：'}</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><code>eval()</code> - 文字列を{isSecure ? '直接JavaScriptコードとして実行' : 'JavaScriptコードとして実行'}</li>
          <li><code>Function()</code> - 動的に関数を生成{isSecure ? 'して実行' : 'して実行'}</li>
          <li><code>setTimeout(string)</code> - 文字列を{isSecure ? 'コードとして遅延実行' : 'コードとして遅延実行'}</li>
          <li>{isSecure ? '動的インラインスクリプト - DOM操作でスクリプト要素を追加' : '動的インラインスクリプト - DOM操作でスクリプト要素を追加'}</li>
          {isSecure && (
            <>
              <li>XSS攻撃の主要な実行経路を遮断</li>
              <li>コードインジェクション攻撃を防止</li>
              <li>安全なコーディング実践を強制</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

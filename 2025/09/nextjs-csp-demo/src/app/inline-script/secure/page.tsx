'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import CodeExecutionTestForm from '../components/CodeExecutionTestForm';
import TestResultsDisplay from '../components/TestResultsDisplay';

export default function SecureInlineScriptPage() {
  const [userCode, setUserCode] = useState('alert("Hello World!");');
  const [evalResults, setEvalResults] = useState<string[]>([]);

  const attemptEval = () => {
    try {
      // CSPにより、eval()の実行がブロックされる
      const result = eval(userCode);
      setEvalResults(prev => [...prev, `⚠️ eval()実行成功（予期しない）: ${userCode} → ${result}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `🛡️ CSPによりeval()をブロック: ${error}`]);
    }
  };

  const attemptFunction = () => {
    try {
      // CSPにより、Functionコンストラクタの実行がブロックされる
      const dynamicFunction = new Function(userCode);
      const result = dynamicFunction();
      setEvalResults(prev => [...prev, `⚠️ Function()実行成功（予期しない）: ${userCode} → ${result}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `🛡️ CSPによりFunction()をブロック: ${error}`]);
    }
  };

  const attemptTimeout = () => {
    try {
      // CSPにより、文字列のsetTimeout実行がブロックされる
      setTimeout(userCode, 100);
      setEvalResults(prev => [...prev, `⚠️ setTimeout()実行成功（予期しない）: ${userCode}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `🛡️ CSPによりsetTimeout(string)をブロック: ${error}`]);
    }
  };

  const attemptInlineScript = () => {
    try {
      // CSPにより、インラインスクリプトの実行がブロックされる
      const script = document.createElement('script');
      script.innerHTML = userCode;
      script.onerror = () => {
        setEvalResults(prev => [...prev, `🛡️ CSPによりインラインスクリプトをブロック`]);
      };
      document.head.appendChild(script);
      setEvalResults(prev => [...prev, `🔍 インラインスクリプト注入試行: ${userCode}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `🛡️ インラインスクリプト注入エラー: ${error}`]);
    }
  };

  const demonstrateSecureAlternatives = () => {
    // 安全な代替手段の例
    setEvalResults(prev => [...prev, `✅ 安全な代替案: JSON.parse() を使用してデータ解析`]);
    
    try {
      // 安全：JSON.parseを使用
      const safeData = JSON.parse('{"message": "これは安全です"}');
      setEvalResults(prev => [...prev, `✅ JSON.parse()成功: ${safeData.message}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `❌ JSON.parse()エラー: ${error}`]);
    }

    // 安全：事前定義された関数を使用
    const safeFunctions: {[key: string]: () => string} = {
      'greeting': () => 'こんにちは！',
      'time': () => new Date().toLocaleString(),
      'random': () => Math.random().toString()
    };
    
    const functionName = 'greeting';
    if (safeFunctions[functionName]) {
      const result = safeFunctions[functionName]();
      setEvalResults(prev => [...prev, `✅ 安全な関数実行: ${functionName}() → ${result}`]);
    }
  };

  return (
    <DemoLayout
      title="インラインスクリプト・evalの禁止 - CSP有効版"
      description="このページではCSPが設定されているため、eval()、Function()、インラインスクリプトなどの危険なコード実行がブロックされ、XSS攻撃から保護されます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">CSPによる動的コード実行の制限：</h3>
          <p className="text-green-700 mb-4">
            <code>script-src</code> ディレクティブに <code>'unsafe-eval'</code> や <code>'unsafe-inline'</code> 
            が含まれていないため、危険な動的コード実行がブロックされます。
          </p>
          
          <div className="bg-blue-100 p-3 rounded text-sm">
            <strong>🔒 ブロックされる実行方法：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><code>eval()</code> - 文字列のコード実行をブロック</li>
              <li><code>Function()</code> - 動的関数生成をブロック</li>
              <li><code>setTimeout(string)</code> - 文字列の遅延実行をブロック</li>
              <li>インラインスクリプト - script要素内のコードをブロック</li>
              <li>インラインイベントハンドラ - onclick等の属性をブロック</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🧪 CSP保護のテスト：</h3>
          <p className="text-blue-700 mb-2">同じ危険なコードを実行してみても、CSPによりブロックされます：</p>
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded font-mono">
              document.cookie  // ブロックされる
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`fetch('/api/user').then(r=>r.json()).then(console.log)  // ブロックされる`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              localStorage.getItem('token')  // ブロックされる
            </div>
          </div>
          <p className="text-blue-700 mt-2 text-sm">
            ℹ️ ブラウザの開発者ツール（Console）で「Refused to evaluate...」エラーを確認できます
          </p>
        </div>

        {/* セキュアなコード実行テスト */}
        <CodeExecutionTestForm
          userCode={userCode}
          setUserCode={setUserCode}
          onEvalTest={attemptEval}
          onFunctionTest={attemptFunction}
          onTimeoutTest={attemptTimeout}
          onInlineScriptTest={attemptInlineScript}
          onSecureAlternativeTest={demonstrateSecureAlternatives}
          isSecure={true}
        />

        {/* 安全な代替手段の説明 */}
        <div className="border rounded-lg p-6 bg-emerald-50">
          <h3 className="text-lg font-semibold mb-4 text-emerald-800">✅ 安全な代替実装パターン</h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-green-300 rounded bg-white">
              <h4 className="font-medium text-green-800 mb-2">1. eval() の代わり</h4>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-red-700 font-medium">❌ 危険</div>
                    <div className="bg-red-100 p-2 rounded font-mono text-xs">
                      eval('({' + jsonString + '})')
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700 font-medium">✅ 安全</div>
                    <div className="bg-green-100 p-2 rounded font-mono text-xs">
                      JSON.parse(jsonString)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-blue-300 rounded bg-white">
              <h4 className="font-medium text-blue-800 mb-2">2. 動的関数実行の代わり</h4>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-red-700 font-medium">❌ 危険</div>
                    <div className="bg-red-100 p-2 rounded font-mono text-xs">
                      new Function(userCode)()
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700 font-medium">✅ 安全</div>
                    <div className="bg-green-100 p-2 rounded font-mono text-xs">
                      {`const handlers = {func1, func2};`}<br />
                      {`handlers[userChoice]()`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-purple-300 rounded bg-white">
              <h4 className="font-medium text-purple-800 mb-2">3. インラインイベントの代わり</h4>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-red-700 font-medium">❌ 危険</div>
                    <div className="bg-red-100 p-2 rounded font-mono text-xs">
                      {`<button onclick="doSomething()">`}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-700 font-medium">✅ 安全</div>
                    <div className="bg-green-100 p-2 rounded font-mono text-xs">
                      {`element.addEventListener('click', fn)`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* テスト結果表示 */}
        <TestResultsDisplay results={evalResults} isSecure={true} />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🛡️ CSPによる保護内容：</h3>
          <ul className="text-green-700 space-y-1 list-disc list-inside">
            <li><code>script-src 'self'</code> - unsafe-eval, unsafe-inlineを除外</li>
            <li><code>eval()</code>, <code>Function()</code> の実行をブロック</li>
            <li><code>setTimeout(string)</code>, <code>setInterval(string)</code> をブロック</li>
            <li>インラインスクリプトとイベントハンドラをブロック</li>
            <li>動的コード生成・実行を完全に防止</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">⚙️ nonce やハッシュを使った安全な実装：</h3>
          <div className="text-purple-700 space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`script-src 'self' 'nonce-randomvalue123'`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`<script nonce="randomvalue123">/* 安全なスクリプト */</script>`}
            </div>
            <p>または、スクリプトのハッシュを使用：</p>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`script-src 'self' 'sha256-hash-of-script-content'`}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 開発時のベストプラクティス：</h3>
          <ul className="text-blue-700 space-y-1 list-disc list-inside">
            <li>eval() や Function() の使用を完全に避ける</li>
            <li>インラインイベントハンドラの代わりにaddEventListener()を使用</li>
            <li>動的コンテンツにはテンプレートエンジンを使用</li>
            <li>ユーザー入力は必ずサニタイズしてから処理</li>
            <li>CSP違反レポートを監視して問題を早期発見</li>
          </ul>
        </div>
      </div>
    </DemoLayout>
  );
}

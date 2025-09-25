import React from 'react';

interface AttackExamplesProps {
  isSecure: boolean;
}

export default function AttackExamples({ isSecure }: AttackExamplesProps) {
  if (isSecure) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">CSP による保護：</h3>
        <p className="text-green-700 mb-2">同じ危険な実装でも、CSP により eval() の実行がブロックされます：</p>
        <div className="space-y-2">
          <div className="bg-gray-100 p-2 rounded text-sm font-mono">
            {`{ "name": "test", "value": 42 }`} ← 正常なJSON（CSPによりブロック）
          </div>
          <div className="bg-red-100 p-2 rounded text-sm font-mono">
            {`(function(){ alert('攻撃!'); return {}; })()`} ← 攻撃コード（CSPによりブロック）
          </div>
        </div>
        <p className="text-green-700 mt-2 text-sm">
          ブラウザの開発者ツール（Console）で「Refused to evaluate...」エラーを確認できます。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="font-semibold text-yellow-800 mb-2">攻撃のテスト方法：</h3>
      <p className="text-yellow-700 mb-2">以下のような悪意のあるコードを入力してみてください：</p>
      <div className="space-y-2">
        <div className="bg-gray-100 p-2 rounded text-sm font-mono">
          {`{ "name": "test", "value": 42 }`}
        </div>
        <div className="bg-red-100 p-2 rounded text-sm font-mono">
          {`(function(){ alert('eval()によるコード実行!'); return {"攻撃": "成功"}; })()`}
        </div>
        <div className="bg-red-100 p-2 rounded text-sm font-mono">
          {`(function(){ console.log(document.cookie); return {"cookie": document.cookie}; })()`}
        </div>
      </div>
    </div>
  );
}

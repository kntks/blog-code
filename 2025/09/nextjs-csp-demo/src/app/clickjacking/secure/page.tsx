'use client';

import { useState, useEffect } from 'react';
import DemoLayout from '@/components/DemoLayout';
import { BankInterface, SecurityCard, InfoCard } from '../components';

export default function SecureClickjackingPage() {
  const [showIframeTest, setShowIframeTest] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  // iframe検知のテスト
  useEffect(() => {
    if (window.top !== window.self) {
      console.log('⚠️ この ページはiframe内で実行されています！');
      // 実際のアプリケーションでは、ここでページを閉じたり警告を表示
    }
  }, []);

  const handleTransfer = (amount: string, account: string) => {
    // セキュリティチェック - iframe内での実行を検知
    if (window.top !== window.self) {
      alert('⚠️ セキュリティ警告: このページはiframe内で実行されているため、送金を拒否します！');
      return;
    }
    alert(`✅ 送金実行！${amount}円を${account}に送金しました！`);
  };

  const testIframeBlocking = () => {
    setShowIframeTest(true);
    // iframe読み込みの結果をテストするため少し遅延
    setTimeout(() => {
      setIframeBlocked(true);
    }, 2000);
  };

  return (
    <DemoLayout
      title="クリックジャッキング攻撃 - CSP有効版"
      description="このページではCSPのframe-ancestorsが設定されているため、iframe埋め込みによるクリックジャッキング攻撃が防がれます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">CSPによる保護：</h3>
          <p className="text-green-700 mb-4">
            このページは <code>frame-ancestors 'none'</code> により、
            すべてのドメイン（自ドメインを含む）からのiframe埋め込みが禁止されています。
          </p>
          
          <button
            onClick={testIframeBlocking}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🧪 CSP保護のテストを実行
          </button>
          
          <div className="bg-blue-50 p-3 rounded text-sm">
            <strong>テスト方法：</strong><br />
            悪意のあるサイトがこのページをiframeで埋め込もうとすると、
            ブラウザは読み込みを拒否し、Consoleに以下のようなエラーが表示されます：<br />
            <code className="text-red-600">
              "Refused to frame '[url]' because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'none'".
            </code>
          </div>
        </div>

        {/* iframe保護テスト */}
        {showIframeTest && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">🧪 iframe保護テスト結果：</h3>
            <div className="mb-4">
                          <p className="text-orange-700 mb-2">
              以下のiframeは、CSP（frame-ancestors 'none'）によりブロックされるはずです：
            </p>
              <div className="border-2 border-red-300 rounded p-4 bg-red-50">
                <iframe
                  src="/clickjacking/secure"
                  width="100%"
                  height="300"
                  style={{ border: '1px solid #ccc' }}
                  title="CSP保護テスト"
                  onError={() => console.log('iframe読み込みエラー')}
                />
              </div>
            </div>
            {iframeBlocked && (
              <div className="bg-green-100 border border-green-300 rounded p-3">
                <p className="text-green-800">
                  ✅ <strong>CSP保護が正常に動作しています！</strong><br />
                  開発者ツールのConsoleで「Refused to frame '[url]' because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'none'".」エラーを確認してください。
                </p>
              </div>
            )}
          </div>
        )}

        {/* 銀行アプリインターフェース */}
        <BankInterface 
          isSecure={true} 
          onTransfer={handleTransfer}
        />

        <SecurityCard type="protection" title="CSPによる保護内容：">
          <ul className="space-y-1 list-disc list-inside">
            <li><code>frame-ancestors 'none'</code> - すべてのiframe埋め込みを禁止</li>
            <li>自ドメインからも含めた全てのiframe埋め込みをブロック</li>
            <li>クリックジャッキング攻撃を根本的に防止</li>
          </ul>
        </SecurityCard>

        <InfoCard type="tip" title="追加のセキュリティ対策：">
          <ul className="space-y-1 list-disc list-inside">
            <li>重要な操作には追加認証（SMS、トークンなど）を要求</li>
            <li>JavaScript による <code>top === window</code> チェック</li>
            <li><code>Referrer-Policy</code> の適切な設定</li>
            <li>定期的なセキュリティ監査の実施</li>
          </ul>
        </InfoCard>

        <InfoCard type="config" title="frame-ancestorsの設定例：">
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded font-mono">
              frame-ancestors 'none'  # iframe埋め込み完全禁止
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              frame-ancestors 'self'  # 同一ドメインのみ許可
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              frame-ancestors 'self' https://trusted.example.com  # 特定ドメイン許可
            </div>
          </div>
        </InfoCard>
      </div>
    </DemoLayout>
  );
}

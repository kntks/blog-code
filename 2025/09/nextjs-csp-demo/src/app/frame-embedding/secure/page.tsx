'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import UrlInputField from '../components/UrlInputField';
import TestResultsDisplay from '../components/TestResultsDisplay';
import InfoCard from '../components/InfoCard';
import FrameContainer from '../components/FrameContainer';

export default function SecureFrameEmbeddingPage() {
  const [iframeUrl, setIframeUrl] = useState('https://example.com');
  const [embedResults, setEmbedResults] = useState<string[]>([]);

  const attemptFrameEmbedding = () => {
    const container = document.getElementById('frame-container');
    if (!container) return;

    // CSPにより制限されたフレーム埋め込みを試行
    container.innerHTML = `
      <div style="border: 2px solid #22c55e; border-radius: 8px; overflow: hidden;">
        <div style="background: #16a34a; color: white; padding: 8px; font-weight: bold;">
          🛡️ CSPによる保護下でのフレーム埋め込みテスト
        </div>
        <div style="position: relative;">
          <iframe 
            src="${iframeUrl}" 
            style="width: 100%; height: 300px; border: none;"
            title="埋め込みテスト"
            onload="window.handleFrameLoad()"
            onerror="window.handleFrameError()"
          ></iframe>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: rgba(34, 197, 94, 0.9); color: white; padding: 12px; border-radius: 8px; 
                      font-weight: bold; text-align: center; pointer-events: none; display: none;" 
               id="loading-indicator">
            読み込み中...
          </div>
        </div>
      </div>
    `;
    
    setEmbedResults(prev => [...prev, `🔍 フレーム埋め込み試行: ${iframeUrl}`]);
    
    // CSPにより多くの外部サイトがブロックされることを示す
    setTimeout(() => {
      setEmbedResults(prev => [...prev, `ℹ️ CSP設定(default-src 'self')により、同一ドメイン以外の埋め込みはブロックされます`]);
    }, 1000);
  };

  const testSecureEmbedding = () => {
    // 許可されているドメインと許可されていないドメインをテスト
    const testCases = [
      { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'blocked', note: 'YouTube埋め込み - default-srcによりブロック予定' },
      { url: 'https://malicious-site.com', expected: 'blocked', note: 'CSPによりブロック予定' },
      { url: 'https://untrusted-ads.com', expected: 'blocked', note: '広告サイト - ブロック予定' },
      { url: '/safe-content.html', expected: 'allowed', note: '同一ドメイン - 許可' }
    ];

    testCases.forEach((testCase, index) => {
      setTimeout(() => {
        const testFrame = document.createElement('iframe');
        testFrame.src = testCase.url;
        testFrame.style.width = '1px';
        testFrame.style.height = '1px';
        testFrame.style.display = 'none';
        
        testFrame.onload = () => {
          setEmbedResults(prev => [...prev, 
            testCase.expected === 'allowed' 
              ? `✅ ${testCase.note}: ${testCase.url}` 
              : `⚠️ 予期しない許可: ${testCase.url}`
          ]);
        };
        
        testFrame.onerror = () => {
          setEmbedResults(prev => [...prev, 
            testCase.expected === 'blocked' 
              ? `🛡️ CSPによりブロック - ${testCase.note}: ${testCase.url}` 
              : `❌ 予期しないエラー: ${testCase.url}`
          ]);
        };
        
        document.body.appendChild(testFrame);
        
        // CSPによるブロックを検出（実際の実装ではより詳細な検証が必要）
        setTimeout(() => {
          try {
            // フレームのコンテンツにアクセスを試みる（same-origin policy違反でエラーになる場合がある）
            const frameDoc = testFrame.contentDocument;
            if (!frameDoc && testCase.expected === 'blocked') {
              setEmbedResults(prev => [...prev, `🛡️ CSPまたはX-Frame-Optionsによりブロック: ${testCase.url}`]);
            }
          } catch (error) {
            if (testCase.expected === 'blocked') {
              setEmbedResults(prev => [...prev, `🛡️ セキュリティポリシーによりブロック: ${testCase.url}`]);
            }
          }
        }, 500);
        
      }, index * 300);
    });
  };

  return (
    <DemoLayout
      title="フレーム埋め込み制御 - CSP有効版"
      description="このページではCSPのdefault-src 'self'が設定されているため、同一ドメイン以外の外部サイトの埋め込みがブロックされ、悪意のあるフレーム攻撃から保護されます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <InfoCard title="CSPによるフレーム制御：" variant="success">
          <p className="mb-4">
            現在のCSP設定では<code>frame-src</code>が明示的に設定されていませんが、
            <code>default-src 'self'</code>により、iframe で埋め込み可能なドメインは同一ドメインのみに制限されています。
          </p>
          
          <div className="bg-blue-100 p-3 rounded text-sm">
            <strong>🔒 現在のCSP設定：</strong>
            <div className="mt-2 space-y-1">
              <div><code>default-src 'self'</code> - すべてのリソースを同一ドメインのみに制限</div>
              <div>※ frame-srcが未設定の場合、default-srcが適用される</div>
            </div>
            <div className="mt-3">
              <strong>追加可能な設定例：</strong>
              <div className="mt-2 space-y-1">
                <div><code>frame-src 'none'</code> - すべての埋め込みを明示的に禁止</div>
                <div><code>frame-src 'self' https://www.youtube.com</code> - YouTube埋め込みも許可</div>
              </div>
            </div>
          </div>
        </InfoCard>

        {/* セキュアなフレーム埋め込みテスト */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-700">🛡️ セキュアなフレーム埋め込みテスト</h3>
          
          <UrlInputField
            value={iframeUrl}
            onChange={setIframeUrl}
            helperText="ℹ️ CSPのdefault-src 'self'により、同一ドメイン以外はブロックされます"
            helperTextColor="text-green-600"
          />
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={attemptFrameEmbedding}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              埋め込みテスト実行
            </button>
            
            <button
              onClick={testSecureEmbedding}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              セキュリティテスト実行
            </button>
          </div>

          <FrameContainer 
            id="frame-container"
            borderStyle="border-green-300"
            placeholder="埋め込みテスト結果がここに表示されます"
          >
            <div className="text-gray-500 text-center">
              埋め込みテスト結果がここに表示されます
              <br />
              <span className="text-sm">(同一ドメイン以外は default-src 'self' によりブロックされます)</span>
            </div>
          </FrameContainer>

          <div className="p-3 bg-green-100 rounded text-sm">
            <strong>CSPによる保護効果：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>許可されていないドメインの埋め込みを完全にブロック</li>
              <li>悪意のあるサイトからの不正利用を防止</li>
              <li>フィッシング攻撃での悪用を防止</li>
              <li>意図しない第三者コンテンツの表示を防止</li>
            </ul>
          </div>
        </div>

        {/* 許可/拒否の例 */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">✅ ❌ 埋め込み許可/拒否の例</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-green-300 rounded bg-green-50">
              <h4 className="font-medium text-green-800 mb-3">✅ 許可される埋め込み</h4>
              <div className="text-sm text-green-700 space-y-2">
                <div className="p-2 bg-white rounded font-mono text-xs">
                  /safe-content.html
                </div>
                <div className="p-2 bg-white rounded font-mono text-xs line-through opacity-50">
                  https://www.youtube.com/embed/VIDEO_ID
                </div>
                <div className="p-2 bg-white rounded font-mono text-xs line-through opacity-50">
                  https://trusted-partner.com/widget
                </div>
                <p className="text-xs text-green-600 mt-2">
                  ℹ️ 現在のCSP設定では同一ドメインのみ許可
                </p>
              </div>
            </div>
            
            <div className="p-4 border border-red-300 rounded bg-red-50">
              <h4 className="font-medium text-red-800 mb-3">❌ ブロックされる埋め込み</h4>
              <div className="text-sm text-red-700 space-y-2">
                <div className="p-2 bg-white rounded font-mono text-xs">
                  https://malicious-site.com/phishing.html
                </div>
                <div className="p-2 bg-white rounded font-mono text-xs">
                  https://untrusted-ads.com/banner.html
                </div>
                <div className="p-2 bg-white rounded font-mono text-xs">
                  http://insecure-site.com/content.html
                </div>
                <p className="text-xs text-red-600 mt-2">
                  🛡️ default-src 'self' により自動的にブロックされる
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* テスト結果 */}
        <TestResultsDisplay
          results={embedResults}
          title="セキュリティテスト結果："
          additionalInfo="ℹ️ ブラウザの開発者ツール（Console）でCSP違反の詳細を確認できます"
        />

        <InfoCard title="🛡️ CSPによる保護内容：" variant="success">
          <ul className="space-y-1 list-disc list-inside">
            <li><code>default-src 'self'</code> - 同一ドメインの埋め込みのみ許可</li>
            <li>外部ドメインからのiframe読み込みを完全ブロック</li>
            <li>悪意のあるサイトでの不正利用を防止</li>
            <li>フィッシング攻撃での信頼性悪用を防止</li>
          </ul>
        </InfoCard>

        <InfoCard title="⚙️ frame-src の設定パターン：" variant="purple">
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded">
              <span className="font-mono">現在の設定: default-src 'self'</span>
              <span className="text-gray-600 text-xs ml-2"># フレーム埋め込みも同一ドメインのみ</span>
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              frame-src 'none'  # 全ての埋め込み禁止
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              frame-src 'self'  # 同一ドメインのみ許可（明示的）
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              frame-src 'self' https://www.youtube.com  # 特定ドメイン追加許可
            </div>
            <div className="bg-gray-100 p-2 rounded font-mono">
              frame-src https://*.trusted-cdn.com  # ワイルドカードによるサブドメイン許可
            </div>
          </div>
        </InfoCard>

        <InfoCard title="💡 実装時のベストプラクティス：" variant="info">
          <ul className="space-y-1 list-disc list-inside">
            <li>frame-srcディレクティブを明示的に設定することを推奨</li>
            <li>必要最小限のドメインのみを許可リストに追加</li>
            <li>ワイルドカード（*）の使用は慎重に検討</li>
            <li>定期的に埋め込み許可ドメインを見直し</li>
            <li>frame-ancestors と組み合わせて双方向の保護を実現</li>
          </ul>
        </InfoCard>
      </div>
    </DemoLayout>
  );
}

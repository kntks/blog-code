'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import UrlInputField from '../components/UrlInputField';
import TestResultsDisplay from '../components/TestResultsDisplay';
import InfoCard from '../components/InfoCard';
import FrameContainer from '../components/FrameContainer';

export default function VulnerableFrameEmbeddingPage() {
  const [iframeUrl, setIframeUrl] = useState('https://example.com');
  const [embedResults, setEmbedResults] = useState<string[]>([]);

  const createMaliciousFrame = () => {
    const container = document.getElementById('frame-container');
    if (!container) return;

    // 悪意のあるフレーム構造を作成
    container.innerHTML = `
      <div style="position: relative; border: 2px solid #ff4444; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; padding: 8px; font-weight: bold;">
          🎯 攻撃者のサイト
        </div>
        <div style="position: relative;">
          <iframe 
            src="${iframeUrl}" 
            style="width: 100%; height: 300px; border: none; opacity: 0.3;"
            title="埋め込まれたサイト"
          ></iframe>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: rgba(255, 68, 68, 0.9); color: white; padding: 12px; border-radius: 8px; 
                      font-weight: bold; text-align: center; pointer-events: none;">
            このサイトが不正に埋め込まれています！
          </div>
        </div>
      </div>
    `;
    
    setEmbedResults(prev => [...prev, `⚠️ フレーム埋め込み実行: ${iframeUrl}`]);
  };

  const testEmbeddingVulnerability = () => {
    // 複数の埋め込みパターンをテスト
    const testUrls = [
      'https://www.google.com',
      'https://github.com', 
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://example.com'
    ];

    testUrls.forEach((url, index) => {
      setTimeout(() => {
        const testFrame = document.createElement('iframe');
        testFrame.src = url;
        testFrame.style.width = '100px';
        testFrame.style.height = '100px';
        testFrame.style.display = 'none';
        
        testFrame.onload = () => {
          setEmbedResults(prev => [...prev, `✅ 埋め込み成功: ${url}`]);
        };
        
        testFrame.onerror = () => {
          setEmbedResults(prev => [...prev, `❌ 埋め込み失敗: ${url}`]);
        };
        
        document.body.appendChild(testFrame);
      }, index * 500);
    });
  };

  return (
    <DemoLayout
      title="フレーム埋め込み制御 - CSP無効版"
      description="このページではCSPが設定されていないため、任意の外部サイトをiframeで埋め込むことができ、悪意のある埋め込み攻撃が可能です。"
      isSecure={false}
    >
      <div className="space-y-6">
        <InfoCard title="フレーム埋め込み攻撃とは：" variant="warning">
          <p className="mb-4">
            攻撃者が悪意のあるサイトに正当なサイトをiframe で埋め込み、ユーザーを騙したり、
            フィッシング攻撃を行ったりする手法です。
          </p>
          
          <div className="bg-red-100 p-3 rounded text-sm">
            <strong>⚠️ 攻撃の例：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>銀行サイトを偽のログインページに埋め込み</li>
              <li>正当なサイトを透明にして、その上に偽のボタンを配置</li>
              <li>信頼できるサイトを悪用したフィッシング詐欺</li>
              <li>ユーザーの操作を盗聴・記録</li>
            </ul>
          </div>
        </InfoCard>

        {/* フレーム埋め込みテスト */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-700">🚨 不正なフレーム埋め込みテスト</h3>
          
          <UrlInputField
            value={iframeUrl}
            onChange={setIframeUrl}
          />
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={createMaliciousFrame}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              悪意のある埋め込み実行
            </button>
            
            <button
              onClick={testEmbeddingVulnerability}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              複数サイト埋め込みテスト
            </button>
          </div>

          <FrameContainer 
            id="frame-container"
            placeholder="埋め込み結果がここに表示されます"
          />

          <div className="p-3 bg-red-100 rounded text-sm">
            <strong>この埋め込みが危険な理由：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>埋め込まれたサイトのユーザーが騙される可能性</li>
              <li>正当なサイトの信頼性を悪用</li>
              <li>埋め込み先サイトの操作を監視される可能性</li>
              <li>フィッシング攻撃の隠れ蓑として利用される</li>
            </ul>
          </div>
        </div>

        {/* 攻撃シナリオの説明 */}
        <div className="border rounded-lg p-6 bg-orange-50">
          <h3 className="text-lg font-semibold mb-4 text-orange-800">🎭 攻撃シナリオの例</h3>
          
          <div className="space-y-4">
            <div className="p-4 border border-red-300 rounded bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">1. フィッシング攻撃</h4>
              <div className="text-sm text-red-700 space-y-1">
                <div>• 攻撃者が偽のバンキングサイトを作成</div>
                <div>• 正当な銀行のログインページをiframe で埋め込み</div>
                <div>• ユーザーは正当なサイトだと思い込んでログイン</div>
                <div>• 攻撃者がログイン情報を盗取</div>
              </div>
            </div>
            
            <div className="p-4 border border-orange-300 rounded bg-orange-50">
              <h4 className="font-medium text-orange-800 mb-2">2. UI Redressing</h4>
              <div className="text-sm text-orange-700 space-y-1">
                <div>• 正当なサイトを透明なiframe で埋め込み</div>
                <div>• 偽のボタンやリンクを上に重ねて配置</div>
                <div>• ユーザーは偽のボタンをクリックしたつもりが、実際は正当なサイトの操作を実行</div>
                <div>• 意図しない操作（送金、設定変更など）を実行させられる</div>
              </div>
            </div>
          </div>
        </div>

        {/* テスト結果 */}
        <TestResultsDisplay
          results={embedResults}
          title="埋め込みテスト結果："
          additionalInfo="ℹ️ 一部のサイトは独自のX-Frame-Options でブロックしている場合があります"
        />

        <InfoCard title="⚠️ この実装の問題点：" variant="error">
          <ul className="space-y-1 list-disc list-inside">
            <li>CSP の <code>frame-src</code> が明示的に設定されていない</li>
            <li><code>default-src 'self'</code> も設定されていないため、任意の外部サイトをiframe で埋め込み可能</li>
            <li>悪意のある埋め込み攻撃への対策なし</li>
            <li>ユーザーが埋め込まれたサイトと気づきにくい</li>
            <li>フィッシング攻撃の足がかりになりやすい</li>
          </ul>
        </InfoCard>

        <InfoCard title="🔍 ブラウザでの確認方法：" variant="info">
          <ul className="space-y-1 list-disc list-inside">
            <li>開発者ツールのElements タブでiframe の構造を確認</li>
            <li>Console タブでフレーム関連のエラーや警告を確認</li>
            <li>アドレスバーのURL が実際の意図とは異なることを確認</li>
            <li>ページのソースコードで不正な埋め込みを発見</li>
          </ul>
        </InfoCard>
      </div>
    </DemoLayout>
  );
}

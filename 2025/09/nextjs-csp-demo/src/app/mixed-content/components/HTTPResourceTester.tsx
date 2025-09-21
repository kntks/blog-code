'use client';

import { useState } from 'react';

interface HTTPResourceTesterProps {
  /** セキュアモード（CSP有効）かどうか */
  isSecure: boolean;
}

export default function HTTPResourceTester({ isSecure }: HTTPResourceTesterProps) {
  const [httpResource, setHttpResource] = useState('http://unsecure-api.example.com/data.json');
  const [mixedResults, setMixedResults] = useState<string[]>([]);

  const loadHTTPResource = async () => {
    try {
      // HTTP API へのリクエストを試行
      const response = await fetch(httpResource);
      if (isSecure) {
        setMixedResults(prev => [...prev, `✅ リソース読み込み成功 (HTTPSにアップグレード): ${httpResource}`]);
      } else {
        setMixedResults(prev => [...prev, `✅ HTTP リソース読み込み成功: ${httpResource}`]);
      }
    } catch (error) {
      const message = isSecure 
        ? `❌ リソース読み込みエラー: ${httpResource} - ${error}`
        : `❌ HTTP リソース読み込みエラー: ${httpResource} - ${error}`;
      setMixedResults(prev => [...prev, message]);
    }
  };

  const testMixedContent = () => {
    // HTTP 画像の読み込みテスト
    const img = new Image();
    img.src = 'http://example.com/insecure-image.jpg';
    img.onload = () => {
      const message = isSecure 
        ? '✅ 画像読み込み成功（HTTPSにアップグレード済み）'
        : '✅ HTTP 画像読み込み成功（非推奨）';
      setMixedResults(prev => [...prev, message]);
    };
    img.onerror = () => {
      const message = isSecure 
        ? '❌ 画像読み込み失敗（HTTPSアップグレード後、リソースが見つからない）'
        : '❌ HTTP 画像読み込み失敗';
      setMixedResults(prev => [...prev, message]);
    };

    // HTTP スクリプトの読み込みテスト
    const script = document.createElement('script');
    script.src = 'http://cdn-insecure.example.com/library.js';
    script.onload = () => {
      const message = isSecure 
        ? '✅ スクリプト読み込み成功（HTTPSにアップグレード済み）'
        : '⚠️ HTTP スクリプト読み込み成功（非常に危険）';
      setMixedResults(prev => [...prev, message]);
    };
    script.onerror = () => {
      const message = isSecure 
        ? '❌ スクリプト読み込み失敗（HTTPSアップグレード後、リソースが見つからない）'
        : '❌ HTTP スクリプト読み込み失敗';
      setMixedResults(prev => [...prev, message]);
    };
    document.head.appendChild(script);
  };

  const clearResults = () => {
    setMixedResults([]);
  };

  return (
    <div className="border rounded-lg p-6">
      <h3 className={`text-lg font-semibold mb-4 ${
        isSecure ? 'text-green-700' : 'text-red-700'
      }`}>
        {isSecure ? '🔒 セキュアなリソース読み込みテスト' : '🚨 HTTP リソース読み込みテスト'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HTTP API エンドポイント：
        </label>
        <input
          type="text"
          value={httpResource}
          onChange={(e) => setHttpResource(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {isSecure && (
          <p className="text-sm text-green-600 mt-1">
            ℹ️ HTTP URLが入力されてもHTTPSに自動アップグレードされます
          </p>
        )}
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={loadHTTPResource}
          className={`${
            isSecure 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
          } text-white px-4 py-2 rounded`}
        >
          {isSecure ? 'API呼び出し（セキュア）' : 'HTTP APIを呼び出し'}
        </button>
        
        <button
          onClick={testMixedContent}
          className={`${
            isSecure 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white px-4 py-2 rounded`}
        >
          {isSecure ? 'コンテンツ読み込みテスト' : '混在コンテンツテスト'}
        </button>

        {mixedResults.length > 0 && (
          <button
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            結果クリア
          </button>
        )}
      </div>

      <div className={`p-3 rounded text-sm ${
        isSecure ? 'bg-green-100' : 'bg-red-100'
      }`}>
        <strong>{isSecure ? 'CSPによる自動保護：' : 'このテストで確認できること：'}</strong>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {isSecure ? (
            <>
              <li>すべてのHTTPリクエストがHTTPSにアップグレード</li>
              <li>中間者攻撃からの保護</li>
              <li>通信内容の暗号化</li>
              <li>混在コンテンツの警告を回避</li>
            </>
          ) : (
            <>
              <li>ブラウザが HTTP リソースをブロックするかどうか</li>
              <li>CSP が設定されていない場合の動作</li>
              <li>混在コンテンツの警告表示</li>
            </>
          )}
        </ul>
      </div>

      {/* 結果表示 */}
      {mixedResults.length > 0 && (
        <div className="mt-6 border rounded-lg p-6 bg-gray-50">
          <h4 className="text-lg font-semibold mb-4">テスト結果：</h4>
          <div className="space-y-2">
            {mixedResults.map((result, index) => (
              <div key={index} className={`text-sm font-mono p-2 rounded border ${
                result.includes('✅') 
                  ? 'bg-green-50 border-green-200' 
                  : result.includes('⚠️')
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                {result}
              </div>
            ))}
          </div>
          {isSecure && (
            <p className="text-sm text-gray-600 mt-3">
              ℹ️ ブラウザの開発者ツール（Network）でHTTPS化されたリクエストを確認できます
            </p>
          )}
        </div>
      )}
    </div>
  );
}

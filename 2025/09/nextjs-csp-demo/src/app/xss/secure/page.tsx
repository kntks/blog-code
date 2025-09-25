'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import XSSExamples from '../components/XSSExamples';
import UserInputForm from '../components/UserInputForm';
import DisplayContent from '../components/DisplayContent';

export default function SecureXSSPage() {

  const [userInput, setUserInput] = useState('');
  const [displayContent, setDisplayContent] = useState('');

  const handleSubmit = () => {
    // 同じ脆弱な実装だが、CSPにより攻撃が防がれる
    setDisplayContent(userInput);
  };

  return (
    <DemoLayout
      title="クロスサイトスクリプティング（XSS）攻撃 - CSP有効版"
      description="このページではCSPが設定されているため、悪意のあるスクリプトの実行がブロックされます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <XSSExamples isSecure={true} />
        
        <UserInputForm
          userInput={userInput}
          setUserInput={setUserInput}
          onSubmit={handleSubmit}
          isSecure={true}
        />

        <DisplayContent content={displayContent} isSecure={true} />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🛡️ CSPによる保護内容：</h3>
          <ul className="text-green-700 space-y-1 list-disc list-inside">
            <li><code>script-src 'self' 'nonce-xxx'</code> - インラインスクリプトをブロック</li>
            <li><code>unsafe-inline</code> を無効化してHTMLイベントハンドラをブロック</li>
            <li><code>javascript:</code> スキームの実行をブロック</li>
            <li><code>eval()</code> や <code>Function()</code> の実行をブロック</li>
            <li>外部ドメインからの悪意のあるスクリプト読み込みをブロック</li>
          </ul>
          
          <div className="mt-3 p-3 bg-white rounded border">
            <h4 className="font-semibold text-green-800 mb-2">CSPでブロックされる攻撃：</h4>
            <ul className="text-green-700 text-sm space-y-1 list-disc list-inside">
              <li>HTMLイベントハンドラー（onclick、onerror、onload等）</li>
              <li>javascript: スキームを使用したコード実行</li>
              <li>インラインスタイルでのCSS expression攻撃</li>
              <li>動的スクリプト生成（eval、Function等）</li>
              <li>許可されていないドメインからのリソース読み込み</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 セキュリティのベストプラクティス：</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-800 text-sm mb-1">1. 入力のサニタイゼーション:</h4>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside ml-4">
                <li>ユーザー入力は常にエスケープまたはサニタイズする</li>
                <li>DOMPurifyなどのライブラリを使用してHTMLをクリーンアップ</li>
                <li><code>dangerouslySetInnerHTML</code> の使用を避ける</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 text-sm mb-1">2. Defense in Depth:</h4>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside ml-4">
                <li>CSPをセキュリティの多層防御の一部として活用</li>
                <li>HTTPOnly Cookieでセッションを保護</li>
                <li>CSRF トークンでクロスサイトリクエストフォージェリを防止</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 text-sm mb-1">3. CSP運用:</h4>
              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside ml-4">
                <li>定期的にCSP設定を見直し、最小権限の原則を適用</li>
                <li>CSP Report URIで違反を監視</li>
                <li>段階的にCSPを厳格化（Report-Only → Enforcing）</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}

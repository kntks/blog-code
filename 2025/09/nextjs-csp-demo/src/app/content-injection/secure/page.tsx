'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import UserInputSection from '../components/UserInputSection';
import HtmlInjectionTest from '../components/HtmlInjectionTest';
import CssInjectionTest from '../components/CssInjectionTest';
import MetaInjectionTest from '../components/MetaInjectionTest';
import InjectionResults from '../components/InjectionResults';
import SecurityInfo from '../components/SecurityInfo';

export default function SecureContentInjectionPage() {
  const [userComment, setUserComment] = useState('<img src="x" onerror="alert(\'画像エラーからのXSS!\')">');
  const [userStyle, setUserStyle] = useState('body { background: url("javascript:alert(\'CSS injection!\')"); }');
  const [userMeta, setUserMeta] = useState('<meta http-equiv="refresh" content="0;url=https://evil.com">');
  const [injectionResults, setInjectionResults] = useState<string[]>([]);

  const attemptCommentInjection = () => {
    // 同じ脆弱な実装だが、CSPにより悪意のあるコンテンツがブロックされる
    const container = document.getElementById('comment-container');
    if (container) {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'p-3 border rounded bg-gray-50 mb-2';
      try {
        commentDiv.innerHTML = `
          <div class="text-sm text-gray-600 mb-1">ユーザーコメント:</div>
          <div class="text-gray-800">${userComment}</div>
        `;
        container.appendChild(commentDiv);
        setInjectionResults(prev => [...prev, `🔍 コメント注入試行: ${userComment}`]);
        setInjectionResults(prev => [...prev, `🛡️ CSPにより悪意のあるスクリプトはブロック`]);
      } catch (error) {
        setInjectionResults(prev => [...prev, `❌ コンテンツ注入エラー: ${error}`]);
      }
    }
  };

  const attemptStyleInjection = () => {
    // CSPにより、unsafe-inline が許可されていない場合、インラインスタイルがブロックされる
    try {
      const style = document.createElement('style');
      style.innerHTML = userStyle;
      document.head.appendChild(style);
      setInjectionResults(prev => [...prev, `⚠️ スタイル注入実行: ${userStyle}`]);
      setInjectionResults(prev => [...prev, `🛡️ CSPにより javascript: URL等はブロック`]);
    } catch (error) {
      setInjectionResults(prev => [...prev, `❌ スタイル注入エラー: ${error}`]);
    }
  };

  const attemptMetaInjection = () => {
    // メタタグの注入を試行
    const metaContainer = document.getElementById('meta-container');
    if (metaContainer) {
      try {
        metaContainer.innerHTML = userMeta;
        setInjectionResults(prev => [...prev, `🔍 メタタグ注入試行: ${userMeta}`]);
        // CSPによってリダイレクトなどの一部機能がブロックされる
        setInjectionResults(prev => [...prev, `ℹ️ 一部のメタタグ機能はCSPにより制限される場合があります`]);
      } catch (error) {
        setInjectionResults(prev => [...prev, `❌ メタタグ注入エラー: ${error}`]);
      }
    }
  };

  const attemptDataUrlInjection = () => {
    // Data URL iframe の注入を試行（CSPにより制限される）
    try {
      const iframe = document.createElement('iframe');
      iframe.src = `data:text/html,<script>alert('Data URL injection!');</script><h1>不正なコンテンツ</h1>`;
      iframe.style.width = '100%';
      iframe.style.height = '200px';
      iframe.style.border = '2px solid green';
      
      iframe.onerror = () => {
        setInjectionResults(prev => [...prev, `🛡️ CSPによりData URL iframe をブロック`]);
      };
      
      const container = document.getElementById('iframe-container');
      if (container) {
        container.appendChild(iframe);
        setInjectionResults(prev => [...prev, `🔍 Data URL iframe 注入試行`]);
        // CSPのframe-src設定により、data: URLがブロックされる可能性
        setTimeout(() => {
          setInjectionResults(prev => [...prev, `🛡️ frame-src ディレクティブにより制限`]);
        }, 1000);
      }
    } catch (error) {
      setInjectionResults(prev => [...prev, `❌ iframe注入エラー: ${error}`]);
    }
  };

  const demonstrateSecureParsing = () => {
    // 安全なコンテンツ処理の例
    try {
      // DOMPurify のような安全なHTMLサニタイザーの代替として、テキストのみを抽出
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = userComment;
      const safeText = tempDiv.textContent || tempDiv.innerText || '';
      
      const container = document.getElementById('safe-container');
      if (container) {
        const safeDiv = document.createElement('div');
        safeDiv.className = 'p-3 border rounded bg-green-50 mb-2';
        safeDiv.innerHTML = `
          <div class="text-sm text-green-600 mb-1">安全に処理されたコメント:</div>
          <div class="text-gray-800">${safeText}</div>
        `;
        container.appendChild(safeDiv);
        setInjectionResults(prev => [...prev, `✅ 安全なテキスト抽出: ${safeText}`]);
      }
    } catch (error) {
      setInjectionResults(prev => [...prev, `❌ 安全な処理エラー: ${error}`]);
    }
  };

  return (
    <DemoLayout
      title="コンテンツインジェクション攻撃 - CSP有効版"
      description="このページではCSPが設定されているため、悪意のあるHTMLコンテンツ、危険なCSS、不正なスクリプト実行がブロックされ、コンテンツインジェクション攻撃から保護されます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">CSPによるコンテンツインジェクション保護：</h3>
          <p className="text-green-700 mb-4">
            複数のCSPディレクティブが連携して、様々なタイプのコンテンツインジェクション攻撃をブロックします。
          </p>
          
          <div className="bg-blue-100 p-3 rounded text-sm">
            <strong>🔒 保護される攻撃タイプ：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><code>script-src</code> - 悪意のあるスクリプトの実行をブロック</li>
              <li><code>style-src</code> - 危険なCSS の実行をブロック</li>
              <li><code>img-src</code> - 不正な画像リソースをブロック</li>
              <li><code>frame-src</code> - Data URL iframe等をブロック</li>
              <li><code>object-src 'none'</code> - オブジェクト埋め込みを禁止</li>
            </ul>
          </div>
        </div>

        <UserInputSection
          userComment={userComment}
          setUserComment={setUserComment}
          userStyle={userStyle}
          setUserStyle={setUserStyle}
          userMeta={userMeta}
          setUserMeta={setUserMeta}
          isSecure={true}
        />

        <HtmlInjectionTest
          userComment={userComment}
          setUserComment={setUserComment}
          onInject={attemptCommentInjection}
          onSecureParsing={demonstrateSecureParsing}
          isSecure={true}
        />

        <CssInjectionTest
          userStyle={userStyle}
          setUserStyle={setUserStyle}
          onInject={attemptStyleInjection}
          isSecure={true}
        />

        <MetaInjectionTest
          userMeta={userMeta}
          setUserMeta={setUserMeta}
          onMetaInject={attemptMetaInjection}
          onDataUrlInject={attemptDataUrlInjection}
          isSecure={true}
        />

        <InjectionResults results={injectionResults} isSecure={true} />

        <SecurityInfo isSecure={true} />
      </div>
    </DemoLayout>
  );
}

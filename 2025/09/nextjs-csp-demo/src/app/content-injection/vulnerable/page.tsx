'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import UserInputSection from '../components/UserInputSection';
import HtmlInjectionTest from '../components/HtmlInjectionTest';
import CssInjectionTest from '../components/CssInjectionTest';
import MetaInjectionTest from '../components/MetaInjectionTest';
import InjectionResults from '../components/InjectionResults';
import SecurityInfo from '../components/SecurityInfo';
import DomClbringTest from '../components/DomClbringTest';

export default function VulnerableContentInjectionPage() {
  const [userComment, setUserComment] = useState('<img src="x" onerror="alert(\'画像エラーからのXSS!\')">');
  const [userStyle, setUserStyle] = useState('body { background: url("javascript:alert(\'CSS injection!\')"); }');
  const [userMeta, setUserMeta] = useState('<meta http-equiv="refresh" content="0;url=https://evil.com">');
  const [injectedContent, setInjectedContent] = useState<string[]>([]);

  const injectComment = () => {
    // 危険！ユーザー入力をそのままHTML に挿入
    const container = document.getElementById('comment-container');
    if (container) {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'p-3 border rounded bg-gray-50 mb-2';
      commentDiv.innerHTML = `
        <div class="text-sm text-gray-600 mb-1">ユーザーコメント:</div>
        <div class="text-gray-800">${userComment}</div>
      `;
      container.appendChild(commentDiv);
      setInjectedContent(prev => [...prev, `コメント注入: ${userComment}`]);
    }
  };

  const injectStyle = () => {
    // 危険！ユーザー入力をCSSとして挿入
    const style = document.createElement('style');
    style.innerHTML = userStyle;
    document.head.appendChild(style);
    setInjectedContent(prev => [...prev, `スタイル注入: ${userStyle}`]);
  };

  const injectMeta = () => {
    // 危険！ユーザー入力をmetaタグとして挿入
    const metaContainer = document.getElementById('meta-container');
    if (metaContainer) {
      metaContainer.innerHTML = userMeta;
      setInjectedContent(prev => [...prev, `メタタグ注入: ${userMeta}`]);
    }
  };

  const injectDataUrl = () => {
    // 危険！data: URL を使ったコンテンツ注入
    const iframe = document.createElement('iframe');
    iframe.src = `data:text/html,<script>alert('Data URL injection!');</script><h1>不正なコンテンツ</h1>`;
    iframe.style.width = '100%';
    iframe.style.height = '200px';
    iframe.style.border = '2px solid red';
    
    const container = document.getElementById('iframe-container');
    if (container) {
      container.appendChild(iframe);
      setInjectedContent(prev => [...prev, 'Data URL iframe注入実行']);
    }
  };

  const demonstrateDOMClobbering = () => {
    // DOM Clobbering 攻撃のデモ
    const container = document.getElementById('dom-container');
    if (container) {
      container.innerHTML = `
        <img name="console" src="x" onerror="alert('DOM Clobbering!')">
        <form name="document" id="document">
          <input name="cookie" value="偽のcookie値">
        </form>
      `;
      setInjectedContent(prev => [...prev, 'DOM Clobbering攻撃実行']);
    }
  };

  return (
    <DemoLayout
      title="コンテンツインジェクション攻撃 - CSP無効版"
      description="このページではCSPが設定されていないため、悪意のあるHTMLコンテンツ、CSS、メタタグなどが自由に注入され、様々な攻撃が可能です。"
      isSecure={false}
    >
      <div className="space-y-6">
        <UserInputSection
          userComment={userComment}
          setUserComment={setUserComment}
          userStyle={userStyle}
          setUserStyle={setUserStyle}
          userMeta={userMeta}
          setUserMeta={setUserMeta}
          isSecure={false}
        />

        <HtmlInjectionTest
          userComment={userComment}
          setUserComment={setUserComment}
          onInject={injectComment}
          isSecure={false}
        />

        <CssInjectionTest
          userStyle={userStyle}
          setUserStyle={setUserStyle}
          onInject={injectStyle}
          isSecure={false}
        />

        <MetaInjectionTest
          userMeta={userMeta}
          setUserMeta={setUserMeta}
          onMetaInject={injectMeta}
          onDataUrlInject={injectDataUrl}
          isSecure={false}
        />

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-indigo-700">🔄 その他のコンテンツ注入攻撃</h3>
          
          <div className="space-y-3">
            <DomClbringTest onDomClobbering={demonstrateDOMClobbering} />
          </div>
        </div>

        <InjectionResults results={injectedContent} isSecure={false} />

        <SecurityInfo isSecure={false} />
      </div>
    </DemoLayout>
  );
}

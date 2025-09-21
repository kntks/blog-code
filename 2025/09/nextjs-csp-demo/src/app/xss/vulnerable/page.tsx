'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import XSSExamples from '../components/XSSExamples';
import UserInputForm from '../components/UserInputForm';
import DisplayContent from '../components/DisplayContent';

export default function VulnerableXSSPage() {
  const [userInput, setUserInput] = useState('');
  const [displayContent, setDisplayContent] = useState('');

  const handleSubmit = () => {
    // 危険！ユーザー入力をそのままHTMLとして表示
    setDisplayContent(userInput);
  };

  return (
    <DemoLayout
      title="クロスサイトスクリプティング（XSS）攻撃 - CSP無効版"
      description="このページではCSPが設定されていないため、悪意のあるスクリプトが実行される可能性があります。"
      isSecure={false}
    >
      <div className="space-y-6">
        <XSSExamples isSecure={false} />
        
        <UserInputForm
          userInput={userInput}
          setUserInput={setUserInput}
          onSubmit={handleSubmit}
          isSecure={false}
        />

        <DisplayContent content={displayContent} isSecure={false} />

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ この実装の問題点：</h3>
          <ul className="text-red-700 space-y-1 list-disc list-inside">
            <li>ユーザー入力をサニタイズせずにそのまま表示</li>
            <li><code>dangerouslySetInnerHTML</code> を使用してHTMLを直接レンダリング</li>
            <li>CSP ヘッダーが設定されていない</li>
            <li>HTMLイベントハンドラー（onclick、onerror、onloadなど）が実行される</li>
            <li>javascript: スキームが実行される可能性</li>
            <li>悪意のあるSVGやiframeが読み込まれる</li>
          </ul>
          
          <div className="mt-3 p-3 bg-white rounded border">
            <h4 className="font-semibold text-red-800 mb-2">実際に起こりうる攻撃：</h4>
            <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
              <li>Cookieの盗取（<code>document.cookie</code>の送信）</li>
              <li>セッションハイジャック</li>
              <li>偽のログインフォームの表示</li>
              <li>他サイトへの自動リダイレクト</li>
              <li>キーストロークの記録</li>
              <li>マルウェアのダウンロード誘導</li>
            </ul>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}

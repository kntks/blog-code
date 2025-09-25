import React from 'react';

interface MetaInjectionTestProps {
  userMeta: string;
  setUserMeta: (value: string) => void;
  onMetaInject: () => void;
  onDataUrlInject: () => void;
  isSecure: boolean;
}

export default function MetaInjectionTest({
  userMeta,
  setUserMeta,
  onMetaInject,
  onDataUrlInject,
  isSecure
}: MetaInjectionTestProps) {
  const titleColor = isSecure ? 'text-purple-700' : 'text-purple-700';
  const metaButtonColor = isSecure ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-500 hover:bg-purple-600';
  const dataUrlButtonColor = isSecure ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-600';
  const metaContainerBorder = isSecure ? 'border-purple-300' : 'border-purple-300';
  const iframeContainerBorder = isSecure ? 'border-indigo-300' : 'border-indigo-300';

  return (
    <div className="border rounded-lg p-6">
      <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>
        {isSecure ? '🔄 その他のセキュア処理テスト' : '📄 メタタグインジェクションテスト'}
      </h3>
      
      {!isSecure && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メタタグHTML：
            </label>
            <input
              type="text"
              value={userMeta}
              onChange={(e) => setUserMeta(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
          
          <button
            onClick={onMetaInject}
            className={`${metaButtonColor} text-white px-4 py-2 rounded mb-4`}
          >
            メタタグ注入実行
          </button>

          <div id="meta-container" className={`border-2 ${metaContainerBorder} rounded-lg p-4 min-h-[50px] mb-4`}>
            <div className="text-gray-500 text-sm">注入されたメタタグがここに表示されます</div>
          </div>
          
          <div className="mt-4 p-3 bg-purple-100 rounded text-sm mb-4">
            <strong>メタタグ注入の危険性：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>自動リダイレクト（refresh）</li>
              <li>キャッシュ制御の改竄</li>
              <li>文字エンコーディングの変更</li>
              <li>検索エンジン最適化（SEO）の悪用</li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold mb-4 text-indigo-700">🔄 その他のコンテンツ注入攻撃</h3>
          
          <div className="space-y-3">
            <button
              onClick={onDataUrlInject}
              className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Data URL iframe 注入実行
            </button>
          </div>

          <div id="iframe-container" className="border-2 border-indigo-300 rounded-lg p-4 mt-4">
            <div className="text-gray-500 text-sm mb-2">iframe注入結果:</div>
          </div>
        </>
      )}

      {isSecure && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={onMetaInject}
              className={`${metaButtonColor} text-white px-4 py-2 rounded`}
            >
              メタタグ注入テスト
            </button>
            
            <button
              onClick={onDataUrlInject}
              className={`${dataUrlButtonColor} text-white px-4 py-2 rounded`}
            >
              Data URL 注入テスト
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={userMeta}
              onChange={(e) => setUserMeta(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
              placeholder="メタタグを入力"
            />
          </div>

          <div id="meta-container" className={`border-2 ${metaContainerBorder} rounded-lg p-4 mb-4 min-h-[50px]`}>
            <div className="text-gray-500 text-sm">メタタグテスト結果</div>
          </div>

          <div id="iframe-container" className={`border-2 ${iframeContainerBorder} rounded-lg p-4`}>
            <div className="text-gray-500 text-sm">iframe 注入テスト結果</div>
          </div>
        </>
      )}
    </div>
  );
}

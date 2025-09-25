import React from 'react';

interface HtmlInjectionTestProps {
  userComment: string;
  setUserComment: (value: string) => void;
  onInject: () => void;
  isSecure: boolean;
  onSecureParsing?: () => void;
}

export default function HtmlInjectionTest({
  userComment,
  setUserComment,
  onInject,
  isSecure,
  onSecureParsing
}: HtmlInjectionTestProps) {
  const titleColor = isSecure ? 'text-green-700' : 'text-red-700';
  const buttonColor = isSecure ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
  const containerBorderColor = isSecure ? 'border-green-300' : 'border-red-300';
  const containerTitle = isSecure ? 'CSP保護下でのコンテンツ表示' : '注入されたコメントがここに表示されます';

  return (
    <div className="border rounded-lg p-6">
      <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>
        {isSecure ? '🛡️ セキュアなコンテンツ処理テスト' : '🚨 HTML コンテンツ注入テスト'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isSecure ? 'ユーザーコメント（HTML含む）：' : 'ユーザーコメント（HTML）：'}
        </label>
        <textarea
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          rows={3}
          placeholder={isSecure ? "攻撃コードを試してみてください" : undefined}
        />
      </div>
      
      {isSecure && onSecureParsing ? (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={onInject}
            className={`${buttonColor} text-white px-4 py-2 rounded`}
          >
            コンテンツ注入テスト
          </button>
          
          <button
            onClick={onSecureParsing}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
          >
            安全な処理デモ
          </button>
        </div>
      ) : (
        <button
          onClick={onInject}
          className={`${buttonColor} text-white px-4 py-2 rounded mb-4`}
        >
          コメント注入実行
        </button>
      )}

      <div id="comment-container" className={`border-2 ${containerBorderColor} rounded-lg p-4 min-h-[100px] ${isSecure ? 'mb-4' : ''}`}>
        <div className="text-gray-500 text-sm">{containerTitle}</div>
      </div>

      {isSecure && (
        <div id="safe-container" className="border-2 border-emerald-300 rounded-lg p-4 min-h-[100px]">
          <div className="text-gray-500 text-sm">安全に処理されたコンテンツ</div>
        </div>
      )}
    </div>
  );
}

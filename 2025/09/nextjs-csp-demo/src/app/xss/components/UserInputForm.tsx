import React from 'react';

interface UserInputFormProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onSubmit: () => void;
  isSecure: boolean;
}

export default function UserInputForm({ 
  userInput, 
  setUserInput, 
  onSubmit, 
  isSecure 
}: UserInputFormProps) {
  const title = isSecure 
    ? 'ユーザー投稿フォーム（CSP保護あり）'
    : 'ユーザー投稿フォーム（脆弱な実装）';
  
  const placeholder = isSecure 
    ? 'XSS攻撃コードを試してみてください'
    : 'ここにコメントを入力...';

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          コメントを入力してください：
        </label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder={placeholder}
        />
      </div>
      
      <button
        onClick={onSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        投稿する
      </button>
    </div>
  );
}

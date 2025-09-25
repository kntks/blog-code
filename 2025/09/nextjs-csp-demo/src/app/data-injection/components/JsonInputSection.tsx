import React from 'react';

interface JsonInputSectionProps {
  jsonInput: string;
  setJsonInput: (value: string) => void;
  onProcess: () => void;
  isSecure: boolean;
}

export default function JsonInputSection({ 
  jsonInput, 
  setJsonInput, 
  onProcess, 
  isSecure 
}: JsonInputSectionProps) {
  const placeholder = isSecure 
    ? 'CSP により eval() がブロックされることを確認してください' 
    : '{ "name": "例", "value": 123 }';

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        JSON データ処理（{isSecure ? 'CSP 保護あり' : '脆弱な実装'}）
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JSON データを入力してください：
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          rows={6}
          placeholder={placeholder}
        />
      </div>
      
      <button
        onClick={onProcess}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        データを処理
      </button>
    </div>
  );
}

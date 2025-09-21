import React from 'react';

interface DomClbringTestProps {
  onDomClobbering: () => void;
}

export default function DomClbrringTest({ onDomClobbering }: DomClbringTestProps) {
  return (
    <>
      <button
        onClick={onDomClobbering}
        className="w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
      >
        DOM Clobbering 攻撃実行
      </button>

      <div id="dom-container" className="border-2 border-pink-300 rounded-lg p-4 mt-4">
        <div className="text-gray-500 text-sm mb-2">DOM Clobbering結果:</div>
      </div>
    </>
  );
}

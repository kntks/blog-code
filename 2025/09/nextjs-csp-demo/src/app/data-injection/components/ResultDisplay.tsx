import React from 'react';

interface ResultDisplayProps {
  result: any;
  isSecure: boolean;
}

export default function ResultDisplay({ result, isSecure }: ResultDisplayProps) {
  if (!result) return null;

  const bgColor = isSecure ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50';
  const titleColor = isSecure ? 'text-green-800' : 'text-gray-800';

  return (
    <div className={`border ${bgColor} rounded-lg p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>処理結果：</h3>
      <pre className="bg-white p-4 rounded border text-sm overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

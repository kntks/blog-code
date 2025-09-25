import React from 'react';

interface InjectionResultsProps {
  results: string[];
  isSecure: boolean;
}

export default function InjectionResults({ results, isSecure }: InjectionResultsProps) {
  if (results.length === 0) return null;

  const getResultClassName = (result: string) => {
    if (result.includes('✅')) return 'bg-green-50 border-green-200';
    if (result.includes('🛡️')) return 'bg-blue-50 border-blue-200';
    if (result.includes('🔍')) return 'bg-yellow-50 border-yellow-200';
    if (result.includes('⚠️')) return 'bg-orange-50 border-orange-200';
    if (result.includes('ℹ️')) return 'bg-cyan-50 border-cyan-200';
    if (isSecure) return 'bg-gray-50 border-gray-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        {isSecure ? 'CSP保護テスト結果：' : '注入攻撃履歴：'}
      </h3>
      <div className="space-y-2">
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`text-sm font-mono p-2 rounded border ${getResultClassName(result)}`}
          >
            {isSecure ? result : `⚠️ ${result}`}
          </div>
        ))}
      </div>
      {isSecure && (
        <p className="text-sm text-gray-600 mt-3">
          ℹ️ ブラウザの開発者ツールでCSPによる保護状況を詳しく確認できます
        </p>
      )}
    </div>
  );
}

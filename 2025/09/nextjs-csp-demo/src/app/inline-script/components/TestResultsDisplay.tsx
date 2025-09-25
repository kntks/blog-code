interface TestResultsDisplayProps {
  results: string[];
  isSecure: boolean;
}

export default function TestResultsDisplay({ results, isSecure }: TestResultsDisplayProps) {
  if (results.length === 0) return null;

  const title = isSecure ? 'CSP保護テスト結果：' : 'コード実行結果：';
  const infoText = isSecure 
    ? 'ℹ️ ブラウザの開発者ツール（Console）でCSPによるブロック詳細を確認できます'
    : '';

  const getResultStyle = (result: string) => {
    if (result.includes('✅')) {
      return isSecure ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-50 border-yellow-200';
    } else if (result.includes('🛡️')) {
      return 'bg-blue-50 border-blue-200';
    } else if (result.includes('🔍')) {
      return 'bg-yellow-50 border-yellow-200';
    } else if (result.includes('⚠️')) {
      return 'bg-orange-50 border-orange-200';
    } else {
      return isSecure ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`text-sm font-mono p-2 rounded border ${getResultStyle(result)}`}
          >
            {result}
          </div>
        ))}
      </div>
      {infoText && (
        <p className="text-sm text-gray-600 mt-3">
          {infoText}
        </p>
      )}
    </div>
  );
}

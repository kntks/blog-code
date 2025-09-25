interface TestResultsDisplayProps {
  results: string[];
  title?: string;
  additionalInfo?: string;
}

export default function TestResultsDisplay({
  results,
  title = "テスト結果：",
  additionalInfo
}: TestResultsDisplayProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {results.map((result, index) => (
          <div key={index} className={`text-sm font-mono p-2 rounded border ${
            result.includes('✅') 
              ? 'bg-green-50 border-green-200' 
              : result.includes('🛡️')
              ? 'bg-blue-50 border-blue-200'
              : result.includes('⚠️')
              ? 'bg-yellow-50 border-yellow-200'
              : result.includes('❌')
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            {result}
          </div>
        ))}
      </div>
      {additionalInfo && (
        <p className="text-sm text-gray-600 mt-3">
          {additionalInfo}
        </p>
      )}
    </div>
  );
}

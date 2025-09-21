interface ResourceLoadLogProps {
  loadedResources: string[];
  isSecure: boolean;
}

export default function ResourceLoadLog({ loadedResources, isSecure }: ResourceLoadLogProps) {
  if (loadedResources.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">リソース読み込みログ：</h3>
      <div className="space-y-2">
        {loadedResources.map((resource, index) => (
          <div key={index} className={`text-sm font-mono p-2 rounded border ${
            isSecure && resource.includes('❌') 
              ? 'bg-red-50 border-red-200' 
              : isSecure && resource.includes('✅')
              ? 'bg-green-50 border-green-200'
              : 'bg-white'
          }`}>
            {resource}
          </div>
        ))}
      </div>
      {isSecure && (
        <p className="text-sm text-gray-600 mt-3">
          ℹ️ ブラウザの開発者ツール（Console）でCSP違反の詳細を確認できます
        </p>
      )}
    </div>
  );
}

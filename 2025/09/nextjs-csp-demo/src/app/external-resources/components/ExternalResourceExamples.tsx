interface ExternalResourceExamplesProps {
  isSecure: boolean;
}

export default function ExternalResourceExamples({ isSecure }: ExternalResourceExamplesProps) {
  if (isSecure) {
    return (
      <div className="border rounded-lg p-6 bg-green-50">
        <h3 className="text-lg font-semibold mb-4 text-green-800">✅ 許可される安全なリソース</h3>
        
        <div className="space-y-3">
          <div className="p-3 border border-green-300 rounded bg-white">
            <div className="text-sm font-medium text-green-700">同一ドメインのスクリプト</div>
            <div className="text-xs text-green-600 font-mono">https://your-domain.com/safe-script.js</div>
            <div className="text-xs text-green-500 mt-1">✅ 読み込み許可</div>
          </div>
          
          <div className="p-3 border border-blue-300 rounded bg-white">
            <div className="text-sm font-medium text-blue-700">信頼できるCDN</div>
            <div className="text-xs text-blue-600 font-mono">https://cdnjs.cloudflare.com/ajax/libs/...</div>
            <div className="text-xs text-blue-500 mt-1">✅ 読み込み許可（設定により）</div>
          </div>
          
          <div className="p-3 border border-purple-300 rounded bg-white">
            <div className="text-sm font-medium text-purple-700">HTTPS画像リソース</div>
            <div className="text-xs text-purple-600 font-mono">https://images.trusted-site.com/photo.jpg</div>
            <div className="text-xs text-purple-500 mt-1">✅ 読み込み許可</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 bg-red-50">
      <h3 className="text-lg font-semibold mb-4 text-red-800">⚡ ページに既に埋め込まれている外部リソース</h3>
      
      <div className="space-y-3">
        {/* 実際には存在しない広告ネットワーク */}
        <div className="p-3 border border-red-300 rounded">
          <div className="text-sm font-medium text-red-700">悪意のある広告ネットワーク</div>
          <div className="text-xs text-red-600 font-mono">https://evil-ads.malware.com/ad.js</div>
          <div className="text-xs text-red-500 mt-1">📡 ユーザー行動を追跡中...</div>
        </div>
        
        <div className="p-3 border border-orange-300 rounded">
          <div className="text-sm font-medium text-orange-700">不正な統計ツール</div>
          <div className="text-xs text-orange-600 font-mono">http://track.everything.com/collect.js</div>
          <div className="text-xs text-orange-500 mt-1">🕵️ 個人情報収集中...</div>
        </div>
        
        <div className="p-3 border border-purple-300 rounded">
          <div className="text-sm font-medium text-purple-700">暗号通貨マイニングスクリプト</div>
          <div className="text-xs text-purple-600 font-mono">https://coinhive.example.com/miner.js</div>
          <div className="text-xs text-purple-500 mt-1">⛏️ CPUリソースを使用中...</div>
        </div>
      </div>
    </div>
  );
}

interface CSPProtectionInfoProps {
  /** セキュアモード（CSP有効）かどうか */
  isSecure: boolean;
}

export default function CSPProtectionInfo({ isSecure }: CSPProtectionInfoProps) {
  if (isSecure) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">CSPによる保護：</h3>
          <p className="text-green-700 mb-4">
            <code>upgrade-insecure-requests</code> により、すべてのHTTPリクエストが自動的にHTTPSにアップグレードされます。
          </p>
          
          <div className="bg-blue-100 p-3 rounded text-sm">
            <strong>🔒 アップグレードの効果：</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>HTTP画像 → HTTPS画像に自動変換</li>
              <li>HTTP API → HTTPS APIに自動変換</li>
              <li>HTTP CSS/JS → HTTPS CSS/JSに自動変換</li>
              <li>すべての通信が暗号化される</li>
            </ul>
          </div>
        </div>

        {/* アップグレード前後の比較 */}
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">🔄 HTTPSアップグレードの仕組み</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-red-300 rounded bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">CSP無効時（危険）</h4>
              <div className="text-sm text-red-700 space-y-2">
                <div className="font-mono bg-white p-2 rounded">
                  http://api.example.com/data
                </div>
                <div>⬇️</div>
                <div className="font-mono bg-red-100 p-2 rounded">
                  HTTP リクエスト（暗号化なし）
                </div>
                <div className="text-xs text-red-600">🚨 盗聴・改竄のリスク</div>
              </div>
            </div>
            
            <div className="p-4 border border-green-300 rounded bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">CSP有効時（安全）</h4>
              <div className="text-sm text-green-700 space-y-2">
                <div className="font-mono bg-white p-2 rounded">
                  http://api.example.com/data
                </div>
                <div>⬇️ CSP自動変換</div>
                <div className="font-mono bg-green-100 p-2 rounded">
                  https://api.example.com/data
                </div>
                <div className="text-xs text-green-600">🔒 暗号化通信で安全</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Mixed Content（混在コンテンツ）とは：</h3>
        <p className="text-yellow-700 mb-4">
          HTTPS サイトで HTTP リソースを読み込むことで、セキュアな通信が台無しになってしまう問題です。
          CSP の <code>upgrade-insecure-requests</code> により防ぐことができます。
        </p>
        
        <div className="bg-orange-100 p-3 rounded text-sm">
          <strong>⚠️ 危険性：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>HTTP通信は暗号化されていないため、盗聴される可能性</li>
            <li>中間者攻撃によりリソースが改竄される可能性</li>
            <li>ユーザーがHTTPSサイトを安全だと思って情報を入力するが、実際は盗聴されている</li>
          </ul>
        </div>
      </div>

      {/* 危険な混在コンテンツの例 */}
      <div className="border rounded-lg p-6 bg-orange-50">
        <h3 className="text-lg font-semibold mb-4 text-orange-800">⚠️ 危険な混在コンテンツの例</h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-red-300 rounded bg-red-50">
            <h4 className="font-medium text-red-800 mb-2">Active Mixed Content（積極的混在コンテンツ）</h4>
            <div className="text-sm text-red-700 space-y-1">
              <div>• HTTP JavaScript ファイル - <code className="bg-red-200 px-1 rounded">http://example.com/script.js</code></div>
              <div>• HTTP CSS ファイル - <code className="bg-red-200 px-1 rounded">http://example.com/style.css</code></div>
              <div>• HTTP iframe - <code className="bg-red-200 px-1 rounded">&lt;iframe src="http://..."&gt;</code></div>
              <div>• HTTP XMLHttpRequest/fetch</div>
            </div>
            <p className="text-xs text-red-600 mt-2">⚠️ ページ全体のセキュリティを脅かす危険性が高い</p>
          </div>
          
          <div className="p-4 border border-orange-300 rounded bg-orange-50">
            <h4 className="font-medium text-orange-800 mb-2">Passive Mixed Content（受動的混在コンテンツ）</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <div>• HTTP 画像 - <code className="bg-orange-200 px-1 rounded">http://example.com/image.jpg</code></div>
              <div>• HTTP 動画 - <code className="bg-orange-200 px-1 rounded">http://example.com/video.mp4</code></div>
              <div>• HTTP 音声 - <code className="bg-orange-200 px-1 rounded">http://example.com/audio.mp3</code></div>
            </div>
            <p className="text-xs text-orange-600 mt-2">⚠️ 比較的危険性は低いが、改竄される可能性がある</p>
          </div>
        </div>
      </div>
    </div>
  );
}

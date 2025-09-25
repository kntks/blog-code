interface CSPAdditionalInfoProps {
  /** セキュアモード（CSP有効）かどうか */
  isSecure: boolean;
}

export default function CSPAdditionalInfo({ isSecure }: CSPAdditionalInfoProps) {
  if (isSecure) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🛡️ CSPによる保護内容：</h3>
          <ul className="text-green-700 space-y-1 list-disc list-inside">
            <li><code>upgrade-insecure-requests</code> - すべてのHTTPリクエストをHTTPSにアップグレード</li>
            <li><code>block-all-mixed-content</code> - アップグレードできない場合はブロック</li>
            <li>自動的な暗号化通信の確保</li>
            <li>中間者攻撃からの保護</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">⚙️ upgrade-insecure-requestsの動作：</h3>
          <div className="text-purple-700 space-y-2 text-sm">
            <p><strong>1. リクエスト送信前：</strong> ブラウザがHTTPリクエストをHTTPSに変換</p>
            <p><strong>2. DNS解決：</strong> 同じホストのHTTPSエンドポイントに接続を試行</p>
            <p><strong>3. 成功時：</strong> HTTPS通信で暗号化されたデータを取得</p>
            <p><strong>4. 失敗時：</strong> リクエストをブロック（block-all-mixed-content時）</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 実装時の注意点：</h3>
          <ul className="text-blue-700 space-y-1 list-disc list-inside">
            <li>アップグレード先のHTTPSリソースが存在することを確認</li>
            <li>API サーバーがHTTPS通信に対応していることを確認</li>
            <li>証明書の有効性を定期的にチェック</li>
            <li>レガシーシステムとの互換性を考慮</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">⚠️ この実装の問題点：</h3>
        <ul className="text-red-700 space-y-1 list-disc list-inside">
          <li>CSP の <code>upgrade-insecure-requests</code> が設定されていない</li>
          <li>HTTP リソースがそのまま読み込まれる可能性</li>
          <li>中間者攻撃によるリソース改竄のリスク</li>
          <li>ユーザーのプライバシーが保護されない</li>
          <li>ブラウザの警告に依存したセキュリティ</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">🔍 ブラウザでの確認方法：</h3>
        <ul className="text-blue-700 space-y-1 list-disc list-inside">
          <li>開発者ツールの Console タブで混在コンテンツの警告を確認</li>
          <li>Network タブでHTTP/HTTPSリクエストの状況を確認</li>
          <li>アドレスバーの鍵アイコンで接続のセキュリティ状態を確認</li>
          <li>Security タブで詳細なセキュリティ情報を確認</li>
        </ul>
      </div>
    </div>
  );
}

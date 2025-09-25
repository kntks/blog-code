interface SecurityInfoProps {
  isSecure: boolean;
}

export default function SecurityInfo({ isSecure }: SecurityInfoProps) {
  if (isSecure) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 実装のベストプラクティス：</h3>
        <ul className="text-blue-700 space-y-1 list-disc list-inside">
          <li>必要最小限のドメインのみをホワイトリストに追加</li>
          <li>nonce値を使用してインラインスクリプト/スタイルを安全に実行</li>
          <li>strict-dynamicで動的に生成されたスクリプトも適切に制御</li>
          <li>定期的にCSPの違反レポートを確認</li>
          <li>新しい外部サービス導入時はCSP設定を更新</li>
          <li>Subresource Integrity (SRI) と組み合わせて使用</li>
        </ul>
      </div>
    );
  }

  return (
    <>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">攻撃のシミュレーション：</h3>
        <p className="text-yellow-700 mb-4">
          悪意のある外部スクリプトや追跡ピクセルが制限なく読み込まれる様子を確認できます。
          実際の攻撃では、これらのリソースがユーザーデータを盗んだり、不正な操作を行ったりします。
        </p>
        
        <div className="bg-red-100 p-3 rounded text-sm">
          <strong>⚠️ 注意：</strong> これはデモページです。実際の悪意のあるスクリプトではありませんが、
          CSPが無効な場合、これらのリソースが自由に読み込まれることを示しています。
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">⚠️ この実装の問題点：</h3>
        <ul className="text-red-700 space-y-1 list-disc list-inside">
          <li>任意の外部ドメインからスクリプト読み込みが可能</li>
          <li>HTTP/HTTPSの混在コンテンツに制限がない</li>
          <li>悪意のある広告ネットワークの制限がない</li>
          <li>追跡ピクセルやマルウェアの読み込みを防げない</li>
          <li>Content Security Policy が未設定</li>
        </ul>
      </div>
    </>
  );
}

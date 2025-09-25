interface ResourceInputSectionProps {
  scriptUrl: string;
  setScriptUrl: (url: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onLoadScript: () => void;
  onLoadImage: () => void;
  isSecure: boolean;
}

export default function ResourceInputSection({
  scriptUrl,
  setScriptUrl,
  imageUrl,
  setImageUrl,
  onLoadScript,
  onLoadImage,
  isSecure
}: ResourceInputSectionProps) {
  return (
    <>
      {/* 悪意のあるスクリプト読み込みテスト */}
      <div className="border rounded-lg p-6">
        <h3 className={`text-lg font-semibold mb-4 ${
          isSecure ? 'text-green-700' : 'text-red-700'
        }`}>
          {isSecure ? '🛡️ 外部スクリプト読み込みテスト' : '🚨 悪意のあるスクリプト読み込み'}
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            外部スクリプトURL：
          </label>
          <input
            type="text"
            value={scriptUrl}
            onChange={(e) => setScriptUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {isSecure && (
            <p className="text-sm text-gray-500 mt-1">
              ℹ️ 外部ドメインのスクリプトはCSPによりブロックされます
            </p>
          )}
        </div>
        
        <button
          onClick={onLoadScript}
          className={`px-4 py-2 rounded text-white ${
            isSecure 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isSecure ? '外部スクリプト読み込みテスト' : '外部スクリプトを読み込み'}
        </button>
        
        <div className={`mt-4 p-3 rounded text-sm ${
          isSecure ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <strong>
            {isSecure 
              ? 'CSPによりブロックされる悪意のある動作：' 
              : 'このスクリプトが実行される可能性のある悪意のある動作：'
            }
          </strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>未承認の外部ドメインからのスクリプト実行</li>
            <li>データ収集スクリプトやトラッキングコードの実行</li>
            <li>マルウェアやクリプトマイナーの読み込み</li>
            <li>不正な広告ネットワークのスクリプト</li>
            {!isSecure && (
              <>
                <li>Cookie やローカルストレージの情報を外部サーバーに送信</li>
                <li>フォーム入力内容の盗取（クレジットカード情報など）</li>
                <li>キーロガー機能でパスワード入力を記録</li>
                <li>画面の改竄や偽のログインフォームの表示</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* 追跡ピクセル読み込みテスト */}
      <div className="border rounded-lg p-6">
        <h3 className={`text-lg font-semibold mb-4 ${
          isSecure ? 'text-blue-700' : 'text-orange-700'
        }`}>
          {isSecure ? '🔒 画像リソース読み込みテスト' : '📊 追跡ピクセル・広告読み込み'}
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isSecure ? '画像/ピクセルURL：' : '追跡ピクセル/広告URL：'}
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {isSecure && (
            <p className="text-sm text-gray-500 mt-1">
              ℹ️ HTTPの画像はHTTPSにアップグレードされるか、ブロックされます
            </p>
          )}
        </div>
        
        <button
          onClick={onLoadImage}
          className={`px-4 py-2 rounded text-white ${
            isSecure 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isSecure ? '画像読み込みテスト' : '追跡ピクセルを読み込み'}
        </button>
        
        <div className={`mt-4 p-3 rounded text-sm ${
          isSecure ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <strong>
            {isSecure 
              ? '許可される安全な画像読み込み：' 
              : 'この追跡ピクセルが実行する可能性のある動作：'
            }
          </strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            {isSecure ? (
              <>
                <li>同一ドメインの画像 (self)</li>
                <li>data: スキームの画像 (Base64エンコード)</li>
                <li>HTTPS の外部画像（信頼できるドメインのみ）</li>
                <li>HTTPはHTTPSにアップグレード</li>
              </>
            ) : (
              <>
                <li>ユーザーの訪問履歴を記録</li>
                <li>IPアドレス、ブラウザ情報、デバイス情報の収集</li>
                <li>クロスサイトトラッキングによるユーザープロファイル作成</li>
                <li>不正な広告や詐欺サイトへの誘導</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

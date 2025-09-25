
import Link from 'next/link';

// 脆弱性データの型定義
interface Vulnerability {
  id: number;
  title: string;
  description: string;
  path: string;
}

// 脆弱性データの配列
const vulnerabilities: Vulnerability[] = [
  {
    id: 1,
    title: 'クロスサイトスクリプティング（XSS）攻撃',
    description: '悪意のあるスクリプトが実行される脆弱性',
    path: 'xss'
  },
  {
    id: 2,
    title: 'データインジェクション攻撃',
    description: '不正なデータが注入される脆弱性',
    path: 'data-injection'
  },
  {
    id: 3,
    title: 'クリックジャッキング攻撃',
    description: '透明なフレームで騙すクリック詐欺攻撃',
    path: 'clickjacking'
  },
  {
    id: 4,
    title: '不正な外部リソースの読み込み',
    description: '悪意のある外部スクリプトや広告の読み込み',
    path: 'external-resources'
  },
  {
    id: 5,
    title: 'HTTPS混在コンテンツ（Mixed Content）',
    description: 'HTTPS サイトでHTTP リソースを読み込む問題',
    path: 'mixed-content'
  },
  {
    id: 6,
    title: 'フレーム埋め込み制御',
    description: 'iframe による不正な埋め込み対策',
    path: 'frame-embedding'
  },
  {
    id: 7,
    title: 'インラインスクリプト・evalの禁止',
    description: '危険なインラインスクリプトやeval() の実行防止',
    path: 'inline-script'
  },
  {
    id: 8,
    title: 'コンテンツインジェクション',
    description: '不正なコンテンツが注入される攻撃',
    path: 'content-injection'
  }
];

// 脆弱性カードコンポーネント
function VulnerabilityCard({ vulnerability }: { vulnerability: Vulnerability }) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-3">
        {vulnerability.id}. {vulnerability.title}
      </h3>
      <p className="mb-4">{vulnerability.description}</p>
      <div className="flex gap-4">
        <Link 
          href={`/${vulnerability.path}/vulnerable/`} 
          className="bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200 transition-colors"
        >
          CSP無効版
        </Link>
        <Link 
          href={`/${vulnerability.path}/secure/`} 
          className="bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200 transition-colors"
        >
          CSP有効版
        </Link>
      </div>
    </div>
  );
}

// メインページコンポーネント
export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Content Security Policy (CSP) 脆弱性デモ
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">概要</h2>
          <p className="mb-4">
            このデモでは、Content Security Policy (CSP) が設定されたページと設定されていないページで、
            どのような脆弱性があるかを実際に確認できます。
          </p>
          <p className="mb-4">
            各脆弱性について、<strong className="text-red-600">CSP無効</strong>と
            <strong className="text-green-600">CSP有効</strong>の2つのページを用意しています。
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800">
              <strong>💡 使い方：</strong> 
              まずCSP無効版で攻撃がどのように実行されるかを確認し、
              その後CSP有効版で同じ攻撃がブロックされることを確認してください。
              ブラウザの開発者ツール（Console）でCSP違反エラーも確認できます。
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {vulnerabilities.map((vulnerability) => (
            <VulnerabilityCard 
              key={vulnerability.id} 
              vulnerability={vulnerability} 
            />
          ))}
        </div>
        
      </main>
    </div>
  );
}

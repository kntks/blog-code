'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DemoLayoutProps {
  title: string;
  description: string;
  isSecure: boolean;
  children: React.ReactNode;
}

export default function DemoLayout({ title, description, isSecure, children }: DemoLayoutProps) {
  const pathname = usePathname();
  const statusColor = isSecure ? 'text-green-600' : 'text-red-600';
  const statusBg = isSecure ? 'bg-green-100' : 'bg-red-100';
  const status = isSecure ? 'CSP有効' : 'CSP無効';
  
  const getOppositeLink = () => {
    if (isSecure) {
      return pathname.replace('/secure', '/vulnerable');
    } else {
      return pathname.replace('/vulnerable', '/secure');
    }
  };
  
  const getOppositeLinkText = () => {
    return isSecure ? 'CSP無効版を見る' : 'CSP有効版を見る';
  };
  
  const getOppositeLinkClass = () => {
    return isSecure 
      ? 'bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200'
      : 'bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200';
  };
  
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← ホームに戻る
          </Link>
        </div>
        
        <div className={`${statusBg} p-4 rounded-lg mb-6`}>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${statusColor}`}>{status}</span>
            <span className="text-gray-600">|</span>
            <span className="font-semibold">{title}</span>
          </div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          <p className="text-gray-700 mb-4">{description}</p>
          
          {isSecure && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">適用されているCSP設定：</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• <code>default-src 'self'</code> - 基本的に自分のドメインのみ許可</div>
                <div>• <code>script-src 'self' 'nonce-xxx' 'strict-dynamic'</code> - スクリプトはnonceまたは自ドメインのみ</div>
                <div>• <code>style-src 'self' 'nonce-xxx'</code> - スタイルは自ドメインとnonceのみ許可</div>
                <div>• <code>img-src 'self' blob: data:</code> - 画像は自ドメイン、blob、dataURL許可</div>
                <div>• <code>font-src 'self'</code> - フォントは自ドメインのみ許可</div>
                <div>• <code>object-src 'none'</code> - オブジェクト埋め込み禁止</div>
                <div>• <code>base-uri 'self'</code> - ベースURIは自ドメインのみ許可</div>
                <div>• <code>form-action 'self'</code> - フォームアクションは自ドメインのみ許可、クリックジャッキング攻撃を防止</div>
                <div>• <code>frame-ancestors 'none'</code> - このページの他サイトからの埋め込み禁止</div>
                <div>• <code>upgrade-insecure-requests</code> - HTTP リクエストをHTTPS にアップグレード</div>
              </div>
            </div>
          )}
          
          {!isSecure && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ 警告：</h3>
              <p className="text-red-700">
                このページではCSP が設定されていないため、様々な攻撃に対して脆弱です。
                ブラウザの開発者ツールでConsole を確認すると、攻撃の実行状況を確認できます。
              </p>
            </div>
          )}
        </div>
        
        {children}
        
        <div className="mt-8 pt-8 border-t">
          <div className="flex gap-4">
            <Link href="/" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
              ホームに戻る
            </Link>
            <Link href={getOppositeLink()} className={getOppositeLinkClass()}>
              {getOppositeLinkText()}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

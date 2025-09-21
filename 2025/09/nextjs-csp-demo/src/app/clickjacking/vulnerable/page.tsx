'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import { BankInterface, SecurityCard, InfoCard, AttackSimulation } from '../components';

export default function VulnerableClickjackingPage() {
  const [showAttackDemo, setShowAttackDemo] = useState(false);

  const handleTransfer = (amount: string, account: string) => {
    alert(`⚠️ 送金実行！${amount}円を${account}に送金しました！`);
  };

  return (
    <DemoLayout
      title="クリックジャッキング攻撃 - CSP無効版"
      description="このページではCSPのframe-ancestorsが設定されていないため、iframe埋め込みによるクリックジャッキング攻撃が可能です。"
      isSecure={false}
    >
      <div className="space-y-6">
        <AttackSimulation 
          showAttackDemo={showAttackDemo}
          onToggleDemo={() => setShowAttackDemo(!showAttackDemo)}
        />

        {/* 通常の銀行アプリインターフェース */}
        <BankInterface 
          isSecure={false} 
          onTransfer={handleTransfer}
          initialAccount="攻撃者の口座"
        />

        <SecurityCard type="vulnerability" title="この実装の問題点：">
          <ul className="space-y-1 list-disc list-inside">
            <li>CSPの <code>frame-ancestors</code> が設定されていない</li>
            <li>iframe内での表示を制限していない</li>
            <li>悪意のあるサイトから透明iframe として埋め込まれる可能性</li>
          </ul>
        </SecurityCard>

        <InfoCard type="warning" title="実際の攻撃手順：">
          <ol className="space-y-1 list-decimal list-inside">
            <li>攻撃者が魅力的な偽サイト（ゲーム、動画など）を作成</li>
            <li>そのサイトに銀行サイトを透明なiframe として埋め込み</li>
            <li>iframe を適切な位置に配置（送金ボタンの上など）</li>
            <li>ユーザーがゲームのボタンをクリックしたつもりが送金ボタンをクリック</li>
            <li>ユーザーが気づかないうちに攻撃者に送金される</li>
          </ol>
        </InfoCard>

        <InfoCard type="info" title="ブラウザでの確認方法：">
          <ul className="space-y-1 list-disc list-inside">
            <li>開発者ツールの Elements タブで iframe の存在を確認</li>
            <li>Console タブで frame 関連のエラーや警告をチェック</li>
            <li>Network タブでリソースの読み込み状況を確認</li>
            <li>Security タブでページのセキュリティ状態を確認</li>
          </ul>
        </InfoCard>
      </div>
    </DemoLayout>
  );
}

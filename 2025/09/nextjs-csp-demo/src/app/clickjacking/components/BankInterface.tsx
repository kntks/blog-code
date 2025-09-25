'use client';

import { useState } from 'react';

interface BankInterfaceProps {
  isSecure: boolean;
  onTransfer?: (amount: string, account: string) => void;
  initialAccount?: string;
  initialAmount?: string;
}

export default function BankInterface({ 
  isSecure, 
  onTransfer, 
  initialAccount = '正当な送金先',
  initialAmount = '1000' 
}: BankInterfaceProps) {
  const [transferAmount, setTransferAmount] = useState(initialAmount);
  const [transferAccount, setTransferAccount] = useState(initialAccount);

  const handleTransfer = () => {
    if (onTransfer) {
      onTransfer(transferAmount, transferAccount);
    } else {
      // デフォルトの処理
      if (isSecure) {
        alert(`✅ 送金実行！${transferAmount}円を${transferAccount}に送金しました！`);
      } else {
        alert(`⚠️ 送金実行！${transferAmount}円を${transferAccount}に送金しました！`);
      }
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-blue-50">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded mr-3"></div>
        <h3 className="text-lg font-semibold">
          セキュア銀行オンライン（{isSecure ? '保護済み' : '脆弱'}）
        </h3>
        <div className={`ml-auto flex items-center ${
          isSecure ? 'text-green-600' : 'text-red-600'
        }`}>
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
            {isSecure ? (
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            )}
          </svg>
          {isSecure ? '保護済み' : '保護なし'}
        </div>
      </div>
      
      <div className="bg-white rounded p-4 mb-4">
        <h4 className="font-medium mb-2">口座残高</h4>
        <div className="text-2xl font-bold text-green-600">¥1,234,567</div>
      </div>

      <div className="bg-white rounded p-4">
        <h4 className="font-medium mb-4">送金</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">送金先</label>
            <input
              type="text"
              value={transferAccount}
              onChange={(e) => setTransferAccount(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">金額</label>
            <input
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleTransfer}
            className={`w-full text-white py-3 px-4 rounded font-bold transition-colors ${
              isSecure 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isSecure ? '💰 送金実行（安全）' : '💸 送金実行（危険）'}
          </button>
        </div>
      </div>
    </div>
  );
}

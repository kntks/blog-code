import React from 'react';

interface AttackSimulationProps {
  showAttackDemo: boolean;
  onToggleDemo: () => void;
}

export default function AttackSimulation({ showAttackDemo, onToggleDemo }: AttackSimulationProps) {
  return (
    <>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">クリックジャッキング攻撃のシミュレーション：</h3>
        <p className="text-yellow-700 mb-4">
          この銀行サイトが悪意のあるサイトのiframe内に透明で埋め込まれた場合、
          ユーザーは気づかずに送金ボタンをクリックしてしまう可能性があります。
        </p>
        
        <div className="space-y-2">
          <button
            onClick={onToggleDemo}
            className={`px-4 py-2 rounded ${
              showAttackDemo 
                ? 'bg-red-500 text-white' 
                : 'bg-yellow-500 text-yellow-900'
            }`}
          >
            {showAttackDemo ? '通常表示に戻す' : '🎯 攻撃のシミュレーション表示'}
          </button>
          <p className="text-sm text-yellow-600">
            ※ 実際の攻撃では、ユーザーは重ねられた透明なiframeに気づきません
          </p>
        </div>
      </div>

      {/* 攻撃シミュレーション表示 */}
      {showAttackDemo && (
        <div className="border-4 border-red-500 rounded-lg overflow-hidden bg-red-50">
          <div className="bg-red-600 text-white p-2 text-sm font-bold">
            ⚠️ 攻撃者のサイト - 悪意のある埋め込み
          </div>
          
          {/* 偽のゲームサイト */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 relative">
            <h2 className="text-2xl font-bold mb-4">🎮 無料ゲームサイト</h2>
            <p className="mb-4">クリックして1000万円のゲーム内通貨をGET！</p>
            
            {/* 透明なiframeを重ねる攻撃の再現 */}
            <div className="relative">
              <div className="bg-yellow-400 text-yellow-900 p-8 rounded-lg text-center cursor-pointer hover:bg-yellow-500 transition-colors">
                <div className="text-4xl mb-2">🏆</div>
                <div className="font-bold text-xl">今すぐクリック！</div>
                <div className="text-sm">無料で豪華賞品をゲット</div>
              </div>
              
              {/* 実際の攻撃では、この位置に透明なiframeが配置される */}
              <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center pointer-events-none">
                <div className="bg-red-600 text-white px-3 py-1 rounded text-xs">
                  実際の攻撃では透明なiframeがここに重ねられる
                </div>
              </div>
            </div>
          </div>
          
          {/* iframe埋め込みのデモ */}
          <div className="p-4 bg-gray-100">
            <h4 className="font-bold mb-2 text-red-800">埋め込まれるiframeの内容：</h4>
            <div className="border-2 border-blue-300 rounded overflow-hidden" style={{ height: '400px' }}>
              <iframe
                src="/clickjacking/vulnerable?embedded=true"
                width="100%"
                height="100%"
                style={{ 
                  border: 'none',
                  opacity: 0.7  // デモのため半透明に
                }}
                title="埋め込まれた銀行サイト"
              />
            </div>
            <p className="text-sm text-red-600 mt-2">
              ℹ️ 実際の攻撃では、このiframeは完全に透明（opacity: 0）で配置されます
            </p>
          </div>
        </div>
      )}
    </>
  );
}

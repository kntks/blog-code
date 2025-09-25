'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import JsonInputSection from '../components/JsonInputSection';
import AttackExamples from '../components/AttackExamples';
import ErrorDisplay from '../components/ErrorDisplay';
import ResultDisplay from '../components/ResultDisplay';
import SecurityInfo from '../components/SecurityInfo';

export default function VulnerableDataInjectionPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleProcess = () => {
    try {
      setError('');
      
      // 危険！ユーザー入力を直接eval()で実行
      // 注意：eval以外でもdata injection脆弱性は発生する可能性がある：
      // 1. Functionコンストラクタ: new Function(userInput)
      // 2. innerHTML: element.innerHTML = userInput（XSS）
      // 3. dangerouslySetInnerHTML（React）
      // 4. 動的プロパティアクセス: obj[userInput]（プロトタイプ汚染）
      // 5. JSON.parse後の関数実行
      // 6. テンプレートエンジンでの動的コード生成
      // 7. with文での動的スコープ
      const processedData = eval(`(${jsonInput})`);
      setResult(processedData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  return (
    <DemoLayout
      title="データインジェクション攻撃 - CSP無効版"
      description="このページではCSPが設定されていないため、eval()を使用したデータインジェクション攻撃が可能です。"
      isSecure={false}
    >
      <div className="space-y-6">
        <AttackExamples isSecure={false} />

        <JsonInputSection
          jsonInput={jsonInput}
          setJsonInput={setJsonInput}
          onProcess={handleProcess}
          isSecure={false}
        />

        <ErrorDisplay error={error} isSecure={false} />

        <ResultDisplay result={result} isSecure={false} />

        <SecurityInfo isSecure={false} />
      </div>
    </DemoLayout>
  );
}

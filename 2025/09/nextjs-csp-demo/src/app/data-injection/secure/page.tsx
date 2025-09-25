'use client';

import { useState } from 'react';
import DemoLayout from '@/components/DemoLayout';
import JsonInputSection from '../components/JsonInputSection';
import AttackExamples from '../components/AttackExamples';
import ErrorDisplay from '../components/ErrorDisplay';
import ResultDisplay from '../components/ResultDisplay';
import SecurityInfo from '../components/SecurityInfo';

export default function SecureDataInjectionPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleProcess = () => {
    try {
      setError('');
      
      // 意図的に危険な実装を使用してCSPの効果をデモ
      // CSPが正しく設定されていれば、eval()の実行がブロックされる
      const processedData = eval(`(${jsonInput})`);
      setResult(processedData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  return (
    <DemoLayout
      title="データインジェクション攻撃 - CSP有効版"
      description="このページではCSPが設定されているため、eval()の実行がブロックされ、データインジェクション攻撃が防がれます。"
      isSecure={true}
    >
      <div className="space-y-6">
        <AttackExamples isSecure={true} />

        <JsonInputSection
          jsonInput={jsonInput}
          setJsonInput={setJsonInput}
          onProcess={handleProcess}
          isSecure={true}
        />

        <ErrorDisplay error={error} isSecure={true} />

        <ResultDisplay result={result} isSecure={true} />

        <SecurityInfo isSecure={true} />
      </div>
    </DemoLayout>
  );
}

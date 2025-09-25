import React from 'react';

interface ErrorDisplayProps {
  error: string;
  isSecure: boolean;
}

export default function ErrorDisplay({ error, isSecure }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="border border-red-300 bg-red-50 rounded-lg p-4">
      <h3 className="font-semibold text-red-800 mb-2">
        エラー{isSecure ? '（CSPにより保護）' : ''}：
      </h3>
      <pre className="text-red-700 text-sm">{error}</pre>
      {isSecure && (
        <p className="text-red-600 text-sm mt-2">
          ℹ️ このエラーはCSPによりeval()の実行がブロックされたためです。
        </p>
      )}
    </div>
  );
}

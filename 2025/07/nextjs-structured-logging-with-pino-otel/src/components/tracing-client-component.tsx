"use client";

import { useEffect, useState } from "react";
import logger from "@/lib/logger.client";
import { Button } from "@/components/ui/button";

interface TracingClientComponentProps {
  parentTraceInfo: string;
}

export function TracingClientComponent({ parentTraceInfo }: TracingClientComponentProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Client Component初期化時のログ（Server Componentのtrace_idを含める）
    logger.info("Client component initialized with trace context from server");


    return () => {
      logger.info("Client component cleanup");
    };
  }, [parentTraceInfo]);

  const handleClick = async () => {
    setIsLoading(true);
    const newCount = clickCount + 1;
    
    logger.info( "User clicked button, starting async operation");
    
    // 非同期処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setClickCount(newCount);
    setIsLoading(false);

    logger.info( "Async operation completed successfully");
  };

  const handleError = () => {
    logger.error( "This is a simulated error for testing trace propagation");
  };

  return (
    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
      <h3 className="text-lg font-bold text-green-800 mb-3">
        🌐 Client Component
      </h3>
      <p className="text-green-700 mb-4">
        このコンポーネントはクライアントサイドで実行され、client loggerを使用してログを出力します。
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleClick} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "処理中..." : `ボタンをクリック (${clickCount}回)`}
          </Button>
          
          <Button 
            onClick={handleError}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            エラーログ出力
          </Button>
        </div>

        <div className="text-sm text-green-700">
          <strong>ログ出力タイミング:</strong>
          <ul className="list-disc list-inside mt-1">
            <li>コンポーネント初期化時</li>
            <li>ボタンクリック開始・完了時</li>
            <li>エラーシミュレーション時</li>
            <li>コンポーネントクリーンアップ時</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
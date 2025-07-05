"use server";

import logger from "@/lib/logger.server";
import { TracingClientComponent } from "@/components/tracing-client-component";


async function fetchData() {
  // 非同期処理をシミュレート
  await new Promise(resolve => setTimeout(resolve, 200));
  
  logger.info("Server-side async operation finished");
}

export async function TracingServerComponent() {
  
  // Server Componentでログを出力
  logger.info("Starting server-side rendering with trace context");

  await fetchData(); // 非同期処理を実行

  return (
    <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
      <h2 className="text-xl font-bold text-blue-800 mb-4">
        🖥️ Server Component
      </h2>
      <p className="text-blue-700 mb-4">
        このコンポーネントはサーバーサイドで実行され、server loggerを使用してログを出力します。
      </p>
      <div className="bg-blue-100 p-3 rounded text-sm text-blue-800 mb-4">
        <strong>ログ出力タイミング:</strong>
        <ul className="list-disc list-inside mt-2">
          <li>コンポーネントレンダリング開始時</li>
          <li>非同期処理完了時</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          子コンポーネント (Client Component)
        </h3>
        <TracingClientComponent 
          parentTraceInfo="server-component-trace" 
        />
      </div>
    </div>
  );
}
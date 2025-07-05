import { TracingServerComponent } from "@/components/tracing-server-component";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* OpenTelemetry Tracing Demo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">
            OpenTelemetry Tracing Demo
          </h1>
          <p className="text-center text-muted-foreground mb-8 text-lg">
            PinoとOpenTelemetryを使用して、trace_idをログに含める方法を学ぶデモです。
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-bold text-yellow-800 mb-2">📋 ログ確認方法</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• <strong>サーバーサイドログ:</strong> ターミナルで確認</li>
            </ul>
          </div>
          <TracingServerComponent />
        </div>
      </section>
    </main>
  );
}

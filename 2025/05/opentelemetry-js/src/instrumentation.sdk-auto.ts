import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

const sdk = new NodeSDK({
	traceExporter: new ConsoleSpanExporter(),
	spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
	instrumentations: [
		getNodeAutoInstrumentations({
			"@opentelemetry/instrumentation-fs": { enabled: false },
			"@opentelemetry/instrumentation-express": {
				ignoreLayers: [
					// 設定を追加できる
				],
			},
		}),
	],
});

sdk.start();

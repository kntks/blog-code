import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import {
	ConsoleSpanExporter,
	NodeTracerProvider,
	SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";

const provider = new NodeTracerProvider({
	spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

registerInstrumentations({
	instrumentations: [
		getNodeAutoInstrumentations({
			"@opentelemetry/instrumentation-fs": { enabled: false },
		}),
	],
	tracerProvider: provider,
});

provider.register();

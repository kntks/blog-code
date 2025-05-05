import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
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
		new HttpInstrumentation(),
		new ExpressInstrumentation(),
		new WinstonInstrumentation(),
	],
	tracerProvider: provider,
});

provider.register();

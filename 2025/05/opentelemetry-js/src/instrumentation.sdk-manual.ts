import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

const sdk = new NodeSDK({
	traceExporter: new ConsoleSpanExporter(),
	spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
	instrumentations: [
		new HttpInstrumentation(),
		new ExpressInstrumentation(),
		new WinstonInstrumentation(),
	],
});

sdk.start();

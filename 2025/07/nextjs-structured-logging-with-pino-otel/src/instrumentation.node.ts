import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor, ConsoleSpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import {resourceFromAttributes} from '@opentelemetry/resources'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';


class FilterSpanProcessor extends SimpleSpanProcessor {
  override onEnd(span: ReadableSpan): void {
    if (span.instrumentationScope.name === 'next.js') {
      return
    }
    super.onEnd(span);
  }
}
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'nextjs-structured-logging-with-pino-otel'
  }),
  spanProcessors: [
    new FilterSpanProcessor(new ConsoleSpanExporter())
  ],
  instrumentations: [new PinoInstrumentation()]

});

sdk.start()
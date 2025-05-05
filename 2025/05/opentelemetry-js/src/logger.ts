import { createLogger, format, transports } from "winston";

const logger = createLogger({
	transports: [new transports.Console()],
	format: format.combine(
		format.timestamp({ alias: "time" }),
		format(({ timestamp, ...rest }) => rest)(),
		format.errors({ stack: true }),
		format.splat(),
		format.json(),
	),
});

export default logger;

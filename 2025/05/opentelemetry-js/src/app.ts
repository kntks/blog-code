import express, { type Express } from "express";
import logger from "./logger";

const PORT: number = Number.parseInt(process.env.PORT || "8080");
const app: Express = express();

function getRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get(
	"/rolldice",
	(req, res, next) => next(), // middleware function
	(req, res) => {
		logger.info("Received request to /rolldice");
		res.send(getRandomNumber(1, 6).toString());
	},
);

app.listen(PORT, () => {
	console.log(`Listening for requests on http://localhost:${PORT}`);
});

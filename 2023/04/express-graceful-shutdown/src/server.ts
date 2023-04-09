import express, { Application, Request, Response } from "express";

const app: Application = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

app.post(
  "/",
  async (
    { body: { id } }: Request<{}, {}, { id: number }, {}>,
    res: Response
  ) => {
    console.log("requestID", id);
    await sleep(3000);
    return res.status(200).send({
      response: id,
    });
  }
);

const server = app.listen(PORT, () => {
  console.log(`dev server running at: http://localhost:${PORT}/`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Process terminated.");
  });
});
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated.");
  });
});

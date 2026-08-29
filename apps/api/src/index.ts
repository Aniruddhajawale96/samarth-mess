import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "samarth-mess-api",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "samarth-mess-api",
    version: "v1",
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`[api] Samarth Mess API listening at http://localhost:${port}`);
  });
}

export default app;

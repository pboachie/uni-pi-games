// packages/backend/src/index.ts
import express, { Request, Response } from "express";
import { User } from "shared/src/types";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from backend");
});

// for testing purposes
app.get("/user", (req: Request, res: Response) => {
  const user: User = { id: "1", username: "test" };
  res.json(user);
});

app.listen(5000, () => console.log("Backend running on port 5000"));

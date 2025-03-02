// packages/backend/src/index.ts
import express, { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from backend');
});

app.listen(5000, () => console.log('Backend running on port 5000'));
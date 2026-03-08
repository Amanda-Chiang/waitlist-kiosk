import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger';
import { partiesRouter } from './routes/parties';
import { queueRouter } from './routes/queue';
import { queue } from './queue';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    queueSize: queue.length,
    ts: new Date().toISOString(),
  });
});

app.use('/api/parties', partiesRouter);
app.use('/api/queue', queueRouter);

// 404 catch-all
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Unhandled error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'unhandled_error', message: err.message }));
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

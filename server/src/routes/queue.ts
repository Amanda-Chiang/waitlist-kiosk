import { Router, Request, Response } from 'express';
import { queue } from '../queue';

export const queueRouter = Router();

/** GET /api/queue — return current queue state */
queueRouter.get('/', (_req: Request, res: Response) => {
  return res.json({ count: queue.length, parties: queue });
});

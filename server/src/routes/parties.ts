import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Party } from '../types';
import { validateParty } from '../validation';
import { checkDuplicate } from '../middleware/rateLimit';
import { queue } from '../queue';

export const partiesRouter = Router();

/** POST /api/parties — add a party to the waitlist */
partiesRouter.post('/', (req: Request, res: Response) => {
  const result = validateParty(req.body);

  if (!result.valid) {
    return res.status(400).json({ error: 'Validation failed', details: result.errors });
  }

  const { name, phone, partySize } = result.normalized!;

  if (checkDuplicate(name, phone)) {
    return res.status(409).json({
      error: 'Duplicate submission',
      message: 'This party was recently added. Please wait before trying again.',
    });
  }

  const party: Party = {
    id: uuidv4(),
    name,
    phone,
    partySize,
    createdAt: new Date().toISOString(),
  };

  queue.push(party);
  return res.status(201).json(party);
});

/** DELETE /api/parties/:id — remove a party (e.g. when seated) */
partiesRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = queue.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Party not found' });
  }

  const [removed] = queue.splice(index, 1);
  return res.json({ removed });
});

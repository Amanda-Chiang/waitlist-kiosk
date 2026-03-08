import request from 'supertest';
import app from '../src/app';
import { queue, clearQueue } from '../src/queue';
import { _resetDedup } from '../src/middleware/rateLimit';

// Use unique phones per describe block to avoid cross-test dedup collisions.
// Each phone appears only once across all "happy path" tests.

beforeEach(() => {
  clearQueue();
  _resetDedup();
});

// ---------------------------------------------------------------------------
// POST /api/parties
// ---------------------------------------------------------------------------
describe('POST /api/parties', () => {
  it('creates a party and returns 201 with full Party object', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Alice Nguyen', phone: '5550000001', partySize: 3 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Alice Nguyen', phone: '5550000001', partySize: 3 });
    expect(typeof res.body.id).toBe('string');
    expect(typeof res.body.createdAt).toBe('string');
    // createdAt must be a valid ISO date
    expect(() => new Date(res.body.createdAt)).not.toThrow();
  });

  it('enqueues the party (queue grows by 1)', async () => {
    await request(app).post('/api/parties').send({ name: 'Bob Lee', phone: '5550000002', partySize: 2 });
    expect(queue).toHaveLength(1);
    expect(queue[0].name).toBe('Bob Lee');
  });

  it('multiple parties are kept in FIFO order', async () => {
    await request(app).post('/api/parties').send({ name: 'First', phone: '5550000010', partySize: 1 });
    await request(app).post('/api/parties').send({ name: 'Second', phone: '5550000011', partySize: 1 });
    await request(app).post('/api/parties').send({ name: 'Third', phone: '5550000012', partySize: 1 });

    expect(queue[0].name).toBe('First');
    expect(queue[1].name).toBe('Second');
    expect(queue[2].name).toBe('Third');
  });

  it('normalizes formatted phone to 10-digit string', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Carol Kim', phone: '(555) 000-0003', partySize: 4 });

    expect(res.status).toBe(201);
    expect(res.body.phone).toBe('5550000003');
  });

  it('trims whitespace from name', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: '  Dave Park  ', phone: '5550000004', partySize: 1 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Dave Park');
  });

  it('accepts partySize = 1 (lower bound)', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Eva Solo', phone: '5550000005', partySize: 1 });
    expect(res.status).toBe(201);
  });

  it('accepts partySize = 20 (upper bound)', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Frank Large', phone: '5550000006', partySize: 20 });
    expect(res.status).toBe(201);
  });

  // --- validation failures ---
  it('returns 400 for empty name', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: '', phone: '5550000007', partySize: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.some((d: { field: string }) => d.field === 'name')).toBe(true);
  });

  it('returns 400 for whitespace-only name', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: '   ', phone: '5550000008', partySize: 2 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for phone with fewer than 10 digits', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Grace Hu', phone: '12345', partySize: 2 });
    expect(res.status).toBe(400);
    expect(res.body.details.some((d: { field: string }) => d.field === 'phone')).toBe(true);
  });

  it('returns 400 for partySize = 0', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Henry Oh', phone: '5550000009', partySize: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for partySize = 21', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Iris Tan', phone: '5550000099', partySize: 21 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-integer partySize', async () => {
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Jake Wu', phone: '5550000098', partySize: 3.5 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for completely missing body fields', async () => {
    const res = await request(app).post('/api/parties').send({});
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThanOrEqual(3);
  });

  // --- duplicate protection ---
  it('returns 409 on second identical submission within 10 seconds', async () => {
    const payload = { name: 'Lena Park', phone: '5550000020', partySize: 2 };
    await request(app).post('/api/parties').send(payload);
    const res = await request(app).post('/api/parties').send(payload);

    expect(res.status).toBe(409);
    expect(queue).toHaveLength(1); // only one entry in queue
  });

  it('dedup is case-insensitive on name', async () => {
    await request(app).post('/api/parties').send({ name: 'Mike Chen', phone: '5550000021', partySize: 2 });
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'mike chen', phone: '5550000021', partySize: 2 });
    expect(res.status).toBe(409);
  });

  it('allows same name with different phone (not a duplicate)', async () => {
    await request(app).post('/api/parties').send({ name: 'Nina Scott', phone: '5550000030', partySize: 2 });
    const res = await request(app)
      .post('/api/parties')
      .send({ name: 'Nina Scott', phone: '5550000031', partySize: 2 });
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// GET /api/queue
// ---------------------------------------------------------------------------
describe('GET /api/queue', () => {
  it('returns empty queue on fresh start', async () => {
    const res = await request(app).get('/api/queue');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.parties).toEqual([]);
  });

  it('reflects parties added via POST', async () => {
    await request(app).post('/api/parties').send({ name: 'Owen Jay', phone: '5550000040', partySize: 2 });
    await request(app).post('/api/parties').send({ name: 'Pam Diaz', phone: '5550000041', partySize: 5 });

    const res = await request(app).get('/api/queue');
    expect(res.body.count).toBe(2);
    expect(res.body.parties).toHaveLength(2);
    expect(res.body.parties[0].name).toBe('Owen Jay');
    expect(res.body.parties[1].name).toBe('Pam Diaz');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/parties/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/parties/:id', () => {
  it('removes the party and returns the removed object', async () => {
    const create = await request(app)
      .post('/api/parties')
      .send({ name: 'Quinn Baez', phone: '5550000050', partySize: 1 });

    const { id } = create.body;
    const res = await request(app).delete(`/api/parties/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.removed.id).toBe(id);
    expect(queue).toHaveLength(0);
  });

  it('removes only the targeted party when multiple exist', async () => {
    await request(app).post('/api/parties').send({ name: 'First', phone: '5550000060', partySize: 1 });
    const second = await request(app)
      .post('/api/parties')
      .send({ name: 'Second', phone: '5550000061', partySize: 1 });
    await request(app).post('/api/parties').send({ name: 'Third', phone: '5550000062', partySize: 1 });

    await request(app).delete(`/api/parties/${second.body.id}`);

    expect(queue).toHaveLength(2);
    expect(queue.map((p) => p.name)).toEqual(['First', 'Third']);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/parties/non-existent-uuid');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Party not found');
  });
});

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------
describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(typeof res.body.queueSize).toBe('number');
  });

  it('reflects current queue size', async () => {
    await request(app).post('/api/parties').send({ name: 'Rose Kim', phone: '5550000070', partySize: 2 });
    const res = await request(app).get('/health');
    expect(res.body.queueSize).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Catch-all 404
// ---------------------------------------------------------------------------
describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

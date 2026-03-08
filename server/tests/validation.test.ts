import { validateParty, normalizePhone } from '../src/validation';

// ---------------------------------------------------------------------------
// normalizePhone
// ---------------------------------------------------------------------------
describe('normalizePhone', () => {
  it('returns only digit characters', () => {
    expect(normalizePhone('(555) 123-4567')).toBe('5551234567');
    expect(normalizePhone('+1-555-123-4567')).toBe('15551234567');
    expect(normalizePhone('5551234567')).toBe('5551234567');
    expect(normalizePhone('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// validateParty — happy path
// ---------------------------------------------------------------------------
describe('validateParty — happy path', () => {
  const base = { name: 'John Doe', phone: '555-123-4567', partySize: 4 };

  it('accepts a fully valid payload', () => {
    const r = validateParty(base);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
    expect(r.normalized).toEqual({ name: 'John Doe', phone: '5551234567', partySize: 4 });
  });

  it('accepts phone already in digit-only form', () => {
    const r = validateParty({ ...base, phone: '5551234567' });
    expect(r.valid).toBe(true);
    expect(r.normalized!.phone).toBe('5551234567');
  });

  it('trims leading/trailing whitespace from name', () => {
    const r = validateParty({ ...base, name: '  Jane  ' });
    expect(r.valid).toBe(true);
    expect(r.normalized!.name).toBe('Jane');
  });

  it('accepts partySize boundary: 1', () => {
    expect(validateParty({ ...base, partySize: 1 }).valid).toBe(true);
  });

  it('accepts partySize boundary: 20', () => {
    expect(validateParty({ ...base, partySize: 20 }).valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateParty — name errors
// ---------------------------------------------------------------------------
describe('validateParty — name errors', () => {
  const base = { name: 'John', phone: '5551234567', partySize: 2 };

  it('rejects missing name field', () => {
    const r = validateParty({ phone: base.phone, partySize: base.partySize });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('rejects empty string name', () => {
    const r = validateParty({ ...base, name: '' });
    expect(r.valid).toBe(false);
    expect(r.errors[0].field).toBe('name');
  });

  it('rejects whitespace-only name', () => {
    const r = validateParty({ ...base, name: '   ' });
    expect(r.valid).toBe(false);
    expect(r.errors[0].field).toBe('name');
  });

  it('rejects numeric name', () => {
    const r = validateParty({ ...base, name: 123 });
    expect(r.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateParty — phone errors
// ---------------------------------------------------------------------------
describe('validateParty — phone errors', () => {
  const base = { name: 'John', phone: '5551234567', partySize: 2 };

  it('rejects missing phone field', () => {
    const r = validateParty({ name: base.name, partySize: base.partySize });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('rejects phone with fewer than 10 digits', () => {
    const r = validateParty({ ...base, phone: '12345' });
    expect(r.valid).toBe(false);
    expect(r.errors[0].field).toBe('phone');
  });

  it('rejects phone with more than 10 digits', () => {
    // 11-digit (with country code) not accepted at this layer
    const r = validateParty({ ...base, phone: '15551234567' });
    expect(r.valid).toBe(false);
  });

  it('rejects alphabetic phone', () => {
    const r = validateParty({ ...base, phone: 'not-a-phone' });
    expect(r.valid).toBe(false);
  });

  it('rejects empty phone string', () => {
    const r = validateParty({ ...base, phone: '' });
    expect(r.valid).toBe(false);
  });

  it('rejects numeric phone (not a string)', () => {
    const r = validateParty({ ...base, phone: 5551234567 });
    expect(r.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateParty — partySize errors
// ---------------------------------------------------------------------------
describe('validateParty — partySize errors', () => {
  const base = { name: 'John', phone: '5551234567', partySize: 2 };

  it('rejects missing partySize', () => {
    const r = validateParty({ name: base.name, phone: base.phone });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.field === 'partySize')).toBe(true);
  });

  it('rejects partySize = 0', () => {
    const r = validateParty({ ...base, partySize: 0 });
    expect(r.valid).toBe(false);
    expect(r.errors[0].field).toBe('partySize');
  });

  it('rejects partySize = 21', () => {
    const r = validateParty({ ...base, partySize: 21 });
    expect(r.valid).toBe(false);
  });

  it('rejects negative partySize', () => {
    const r = validateParty({ ...base, partySize: -1 });
    expect(r.valid).toBe(false);
  });

  it('rejects non-integer partySize', () => {
    const r = validateParty({ ...base, partySize: 2.5 });
    expect(r.valid).toBe(false);
  });

  it('rejects string partySize', () => {
    const r = validateParty({ ...base, partySize: '4' });
    expect(r.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateParty — bad body
// ---------------------------------------------------------------------------
describe('validateParty — malformed body', () => {
  it('rejects null', () => {
    expect(validateParty(null).valid).toBe(false);
  });

  it('rejects a raw string', () => {
    expect(validateParty('hello').valid).toBe(false);
  });

  it('rejects an array', () => {
    expect(validateParty([]).valid).toBe(false);
  });

  it('collects all errors when multiple fields are invalid', () => {
    const r = validateParty({ name: '', phone: '123', partySize: 99 });
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThanOrEqual(3);
  });
});

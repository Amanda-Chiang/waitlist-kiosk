import { ValidationResult } from './types';

/** Strip every non-digit character from a phone string. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validate and normalize a raw POST /api/parties body.
 * Returns a typed result so callers don't have to re-validate.
 */
export function validateParty(payload: unknown): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] };
  }

  const { name, phone, partySize } = payload as Record<string, unknown>;

  // --- name ---
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  // --- phone ---
  let normalizedPhone = '';
  if (!phone || typeof phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone is required' });
  } else {
    normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
      errors.push({ field: 'phone', message: 'Phone must be a 10-digit US number' });
    }
  }

  // --- partySize ---
  if (partySize === undefined || partySize === null) {
    errors.push({ field: 'partySize', message: 'Party size is required' });
  } else if (typeof partySize !== 'number' || !Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
    errors.push({ field: 'partySize', message: 'Party size must be an integer between 1 and 20' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    normalized: {
      name: (name as string).trim(),
      phone: normalizedPhone,
      partySize: partySize as number,
    },
  };
}

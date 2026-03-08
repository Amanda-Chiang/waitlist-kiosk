/**
 * Format a raw digit string (0-10 chars) into the display pattern (NXX) NXX-XXXX.
 * Strips any non-digit characters defensively before formatting.
 */
export function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/**
 * Return an error message if `digits` is not exactly 10 digit characters,
 * or null if valid.  The input is expected to be pre-stripped (digits only).
 */
export function validatePhone(digits: string): string | null {
  if (digits.length !== 10) return 'Enter a 10-digit US phone number';
  return null;
}

/** Return an error message if name is blank, or null if valid. */
export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  return null;
}

/**
 * Pure-function unit tests for kiosk utilities.
 * No React Native runtime required — these run in plain Jest/Node.
 */

import { formatPhoneDisplay, validatePhone, validateName } from '../src/utils/phone';

// ---------------------------------------------------------------------------
// formatPhoneDisplay
// ---------------------------------------------------------------------------
describe('formatPhoneDisplay', () => {
  it('returns empty string for empty input', () => {
    expect(formatPhoneDisplay('')).toBe('');
  });

  it('returns raw digits for 1-3 digit input', () => {
    expect(formatPhoneDisplay('5')).toBe('5');
    expect(formatPhoneDisplay('55')).toBe('55');
    expect(formatPhoneDisplay('555')).toBe('555');
  });

  it('formats 4-6 digits as (NXX) X...', () => {
    expect(formatPhoneDisplay('5551')).toBe('(555) 1');
    expect(formatPhoneDisplay('55512')).toBe('(555) 12');
    expect(formatPhoneDisplay('555123')).toBe('(555) 123');
  });

  it('formats 7-9 digits as (NXX) NXX-X...', () => {
    expect(formatPhoneDisplay('5551234')).toBe('(555) 123-4');
    expect(formatPhoneDisplay('55512345')).toBe('(555) 123-45');
    expect(formatPhoneDisplay('555123456')).toBe('(555) 123-456');
  });

  it('formats 10 digits as full (NXX) NXX-XXXX', () => {
    expect(formatPhoneDisplay('5551234567')).toBe('(555) 123-4567');
  });

  it('strips non-digit characters before formatting', () => {
    // Input that is already formatted — common when user deletes one char
    expect(formatPhoneDisplay('(555) 123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneDisplay('555-123-4567')).toBe('(555) 123-4567');
    expect(formatPhoneDisplay('+1-555-123-4567')).toBe('(155) 512-3456'); // 11 digits → trimmed to 10
  });

  it('truncates input beyond 10 digits', () => {
    expect(formatPhoneDisplay('12345678901')).toBe('(123) 456-7890'); // 11th digit dropped
    expect(formatPhoneDisplay('99999999999')).toBe('(999) 999-9999');
  });

  it('handles all-zero phone gracefully', () => {
    expect(formatPhoneDisplay('0000000000')).toBe('(000) 000-0000');
  });
});

// ---------------------------------------------------------------------------
// validatePhone
// ---------------------------------------------------------------------------
describe('validatePhone', () => {
  it('returns null for exactly 10 digits', () => {
    expect(validatePhone('5551234567')).toBeNull();
    expect(validatePhone('0000000000')).toBeNull();
    expect(validatePhone('9999999999')).toBeNull();
  });

  it('returns error message for fewer than 10 digits', () => {
    expect(validatePhone('')).toBeTruthy();
    expect(validatePhone('555')).toBeTruthy();
    expect(validatePhone('555123456')).toBeTruthy(); // 9 digits
  });

  it('returns error message for more than 10 digits', () => {
    expect(validatePhone('55512345678')).toBeTruthy(); // 11 digits
  });

  it('returns error for non-digit characters in input', () => {
    // validatePhone receives pre-stripped digits, but guard defensively
    expect(validatePhone('hello')).toBeTruthy();
    expect(validatePhone('(555) 123')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// validateName
// ---------------------------------------------------------------------------
describe('validateName', () => {
  it('returns null for non-empty names', () => {
    expect(validateName('Alice')).toBeNull();
    expect(validateName('John Doe')).toBeNull();
    expect(validateName('  Padded  ')).toBeNull(); // validateName only checks blank
  });

  it('returns error message for empty string', () => {
    expect(validateName('')).toBeTruthy();
  });

  it('returns error message for whitespace-only string', () => {
    expect(validateName('   ')).toBeTruthy();
    expect(validateName('\t\n')).toBeTruthy();
  });

  it('returns a non-empty string as the error message', () => {
    const result = validateName('');
    expect(typeof result).toBe('string');
    expect((result as string).length).toBeGreaterThan(0);
  });
});

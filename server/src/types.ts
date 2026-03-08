export interface Party {
  id: string;
  name: string;
  /** Normalized 10-digit US phone, no formatting characters */
  phone: string;
  partySize: number;
  /** ISO 8601 wall-clock timestamp of when the party joined the waitlist (e.g. "2024-01-15T14:30:00.000Z") */
  createdAt: string;
}

export interface QueueResponse {
  count: number;
  parties: Party[];
}

export interface CreatePartyPayload {
  name: string;
  phone: string;
  partySize: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  normalized?: {
    name: string;
    phone: string;
    partySize: number;
  };
}

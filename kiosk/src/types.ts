/** Mirrors the server-side Party shape exactly. */
export interface Party {
  id: string;
  name: string;
  /** Normalized 10-digit US phone string */
  phone: string;
  partySize: number;
  /** ISO 8601 timestamp when the party joined */
  createdAt: string;
}

export interface QueueResponse {
  count: number;
  parties: Party[];
}

export interface CreatePartyPayload {
  name: string;
  /** 10 digits, no formatting */
  phone: string;
  partySize: number;
}

export interface ApiValidationDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error: string;
  message?: string;
  details?: ApiValidationDetail[];
}

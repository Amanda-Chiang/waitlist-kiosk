import { API_BASE_URL } from '../config';
import { Party, QueueResponse, CreatePartyPayload, ApiErrorBody } from '../types';

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkErr) {
    // fetch() itself threw — network unreachable, DNS failure, etc.
    throw new Error('Cannot reach the server. Check your Wi-Fi and try again.');
  }

  const json: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const body = json as ApiErrorBody;
    throw new ApiError(
      body.message ?? body.error ?? `Request failed with status ${response.status}`,
      response.status,
      body,
    );
  }

  return json as T;
}

export const api = {
  /** Add a party to the waitlist. Throws ApiError on validation/duplicate errors. */
  createParty: (payload: CreatePartyPayload): Promise<Party> =>
    request<Party>('/api/parties', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Fetch the current queue state. */
  getQueue: (): Promise<QueueResponse> => request<QueueResponse>('/api/queue'),
};

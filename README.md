# Restaurant Waitlist Kiosk
Basic restaurant waitlist kiosk modeled after Toast's UI. Guests enter their name, phone, and party size, and receive a text confirmation. Staff see the live queue via `GET /api/queue`.

---

## Folder Tree

```
waitlist-kiosk/
├── server/                          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── types.ts                 # Shared data types (Party, ValidationResult…)
│   │   ├── validation.ts            # Validation + phone normalization logic
│   │   ├── queue.ts                 # In-memory FIFO queue array
│   │   ├── app.ts                   # Express app (routes, middleware, error handler)
│   │   ├── index.ts                 # HTTP server entry point
│   │   └── middleware/
│   │       ├── logger.ts            # Structured JSON request logger
│   │       └── rateLimit.ts        # Duplicate-submit guard (10-second window)
│   │   └── routes/
│   │       ├── parties.ts           # POST /api/parties, DELETE /api/parties/:id
│   │       └── queue.ts             # GET /api/queue
│   ├── tests/
│   │   ├── validation.test.ts       # Unit tests for validation helpers
│   │   └── api.test.ts              # Integration tests for all API endpoints
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── jest.config.js
│
└── kiosk/                           # React Native (Expo) iPad app
    ├── App.tsx                      # Root — PaperProvider + screen state machine
    ├── app.json                     # Expo config
    ├── babel.config.js
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── types.ts                 # Party, QueueResponse, ApiErrorBody…
    │   ├── config.ts                # API_BASE_URL, auto-reset seconds
    │   ├── api/
    │   │   └── client.ts            # Typed fetch wrapper (createParty, getQueue)
    │   ├── theme/
    │   │   └── theme.ts             # React Native Paper MD3 theme + spacing scale
    │   ├── utils/
    │   │   └── phone.ts             # formatPhoneDisplay, validatePhone, validateName
    │   ├── components/
    │   │   ├── PhoneInput.tsx       # Controlled masked phone field
    │   │   ├── PartyStepper.tsx     # Large +/- stepper (1-20)
    │   │   └── ErrorBanner.tsx      # Inline error alert with retry
    │   └── screens/
    │       ├── HomeScreen.tsx       # Join Waitlist form
    │       └── ConfirmationScreen.tsx # Success + 8-second countdown
    └── __tests__/
        └── utils.test.ts            # Unit tests for phone utility functions
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 LTS or newer |
| npm | 9+ (bundled with Node) |
| Expo CLI | `npm install -g expo-cli` |
| Xcode | 15+ (for iPad simulator) |

---

## Server Setup

```bash
cd waitlist-kiosk/server
npm install

# Development (hot-reload, port 3000)
npm run dev

# Production build + start
npm run build
npm start

# Run all tests
npm test

# Tests with coverage report
npm run test:coverage
```

**Environment variables** — create `server/.env` (optional):

```
PORT=3000
```

`ts-node-dev` respects `.env` files automatically when using the `dotenv` package,
or you can prefix the command: `PORT=4000 npm run dev`.

---

## Kiosk App Setup

```bash
cd waitlist-kiosk/kiosk
npm install

# Start Expo dev server
npm start

# Open directly in iPad simulator (Xcode must be installed)
npm run ios

# Run utility unit tests
npm test
```

### Configuring the API URL

Edit [`src/config.ts`](kiosk/src/config.ts) or set an environment variable before starting:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000 npm start
```

> **Real device note**: `localhost` only works when the simulator runs on the **same machine**
> as the server. On a physical iPad you must use the server's LAN IP address
> (e.g. `http://192.168.1.42:3000`). Both devices must be on the same Wi-Fi network.

### Running on iPad Simulator

1. Start the server: `cd server && npm run dev`
2. Start the kiosk: `cd kiosk && npm run ios`
3. Expo will open the Simulator automatically. In Xcode Simulator:
   - **File → Open Simulator** → choose any iPad model (e.g. iPad Pro 12.9")
   - Or press `i` in the Expo terminal after the metro bundler starts.

### Running on a Physical iPad

```bash
# Install Expo Go from the App Store on the iPad
cd kiosk && npm start
# Scan the QR code with the iPad camera or Expo Go app
```

---

## API Reference

### `POST /api/parties`
Add a party to the waitlist.

**Request body:**
```json
{ "name": "Smith", "phone": "5551234567", "partySize": 4 }
```
`phone` accepts formatted input — `(555) 123-4567`, `555-123-4567`, etc. — and normalizes to 10 raw digits.

**201 Created:**
```json
{
  "id": "a1b2c3d4-...",
  "name": "Smith",
  "phone": "5551234567",
  "partySize": 4,
  "createdAt": "2024-01-15T14:30:00.000Z"
}
```

**400 Bad Request** — validation failure:
```json
{ "error": "Validation failed", "details": [{ "field": "phone", "message": "Phone must be a 10-digit US number" }] }
```

**409 Conflict** — duplicate submission within 10 seconds:
```json
{ "error": "Duplicate submission", "message": "This party was recently added..." }
```

---

### `GET /api/queue`
Return the current queue.

**200 OK:**
```json
{
  "count": 3,
  "parties": [
    { "id": "...", "name": "Smith", "phone": "5551234567", "partySize": 4, "createdAt": "..." },
    ...
  ]
}
```

---

### `DELETE /api/parties/:id`
Remove a party (e.g. when seated).

**200 OK:**
```json
{ "removed": { "id": "...", "name": "Smith", ... } }
```

**404 Not Found** — id doesn't exist in queue.

---

### `GET /health`
Liveness check.

**200 OK:**
```json
{ "status": "ok", "uptimeSeconds": 142, "queueSize": 3, "ts": "2024-01-15T14:32:00.000Z" }
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| In-memory queue | Resets on restart — acceptable per spec. Swap `server/src/queue.ts` for a Redis adapter if persistence is needed. |
| Duplicate guard | Same name + phone blocked for 10 s to prevent double-taps; lives in a single module-level Map. For multi-process, move to Redis. |
| 8-second auto-reset | Confirmation screen auto-returns to home to keep the kiosk ready for the next guest without staff intervention. |
| Digit-only phone state | Kiosk stores raw digits in state; display formatting is a pure view concern (`formatPhoneDisplay`). Avoids cursor-jump issues on linear input. |
| No react-navigation | Two-screen state machine in `App.tsx` — avoids the navigation boilerplate for a simple kiosk flow. |
| MD3 Paper theme | Centralizes colors/typography; easy to rebrand by editing `theme.ts` alone. |
| `maxWidth: 600` on form | Centers content on wide iPad landscape orientation; full-width on phone. |

---

## Throughput & Reliability Notes

- Target: ~100 parties/hour ≈ 1.7/min — well within single-process Node.js capacity.
- Submit button is disabled while a request is in-flight — prevents double-taps.
- Network errors surface an inline `ErrorBanner` with a "Try Again" button; form state is preserved.
- Server logs one JSON line per request (method, path, status, latency) for easy monitoring.
- CORS is open (`*`) — tighten to the kiosk's origin in production.

/**
 * Central configuration.
 *
 * To point the kiosk at a different server, set the environment variable
 * EXPO_PUBLIC_API_URL before starting Expo, e.g.:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.10:3000 npx expo start
 *
 * On a real device you must use the LAN IP of the server machine —
 * "localhost" only works in the iOS/Android simulator on the same machine.
 */
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:3000';

/** Seconds before the confirmation screen auto-resets to home. */
export const CONFIRMATION_AUTO_RESET_SECONDS = 8;

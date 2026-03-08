import { MD3LightTheme } from 'react-native-paper';

/**
 * Kiosk color palette — warm, friendly, high contrast.
 * Inspired by Toast POS / casual dining aesthetic.
 */
export const kioskTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D95B2B',          // warm terracotta orange — main CTA
    primaryContainer: '#FFE5D9', // tinted surface for icon circles
    secondary: '#5C3D2E',        // deep brown — secondary text
    background: '#FAF7F4',       // warm off-white
    surface: '#FFFFFF',
    surfaceVariant: '#F5EDE8',
    error: '#C62828',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#4A1A00',
    onBackground: '#1A1208',
    onSurface: '#1A1208',
    onSurfaceVariant: '#5C3D2E',
    outline: '#C4A99A',
  },
} as const;

/** Shared spacing scale (px). Use these instead of magic numbers. */
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Minimum touch target size recommended for accessibility (44 px per Apple HIG). */
export const MIN_TOUCH = 48;

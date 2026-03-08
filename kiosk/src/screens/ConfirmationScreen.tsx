import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Party } from '../types';
import { spacing } from '../theme/theme';
import { CONFIRMATION_AUTO_RESET_SECONDS } from '../config';

interface Props {
  party: Party;
  onDone: () => void;
}

/**
 * Shown after a successful waitlist submission.
 * Auto-resets to home after CONFIRMATION_AUTO_RESET_SECONDS (default 8).
 */
export function ConfirmationScreen({ party, onDone }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [countdown, setCountdown] = useState(CONFIRMATION_AUTO_RESET_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onDone]);

  // Show only last 4 digits for a bit of privacy on a shared kiosk screen
  const phoneMasked = `••• •••-••${party.phone.slice(-4)}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Success icon */}
        <View
          style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}
          accessible
          accessibilityLabel="Success"
        >
          <Text style={[styles.checkMark, { color: theme.colors.primary }]}>✓</Text>
        </View>

        <Text
          variant="displaySmall"
          style={[styles.heading, { color: theme.colors.primary }]}
          accessibilityRole="header"
        >
          You're on the list!
        </Text>

        <Text
          variant="headlineMedium"
          style={[styles.name, { color: theme.colors.onBackground }]}
          accessibilityLabel={`Party name: ${party.name}`}
        >
          {party.name}
        </Text>

        {/* Detail row: party size + masked phone */}
        <View style={styles.detailRow}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            Party of {party.partySize}
          </Text>
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.onSurfaceVariant }}
            aria-hidden
          >
            ·
          </Text>
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.onBackground }}
            accessibilityLabel={`Phone ending in ${party.phone.slice(-4)}`}
          >
            {phoneMasked}
          </Text>
        </View>

        <Text
          variant="bodyLarge"
          style={[styles.notice, { color: theme.colors.onSurfaceVariant }]}
        >
          We'll send a text when your table is ready.{'\n'}Please stay nearby!
        </Text>

        <Button
          mode="contained"
          onPress={onDone}
          style={styles.doneBtn}
          contentStyle={styles.doneBtnContent}
          labelStyle={styles.doneBtnLabel}
          accessibilityLabel="Done, return to home screen"
          accessibilityRole="button"
        >
          Done
        </Button>

        <Text
          variant="bodyMedium"
          style={[styles.countdown, { color: theme.colors.onSurfaceVariant }]}
          accessibilityLabel={`Returning to home in ${countdown} seconds`}
          accessibilityLiveRegion="polite"
        >
          Returning to home in {countdown}s
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 520,
    width: '100%',
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 60,
    fontWeight: '700',
    lineHeight: 68,
    includeFontPadding: false,
  },
  heading: {
    fontWeight: '800',
    textAlign: 'center',
  },
  name: {
    fontWeight: '700',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  notice: {
    textAlign: 'center',
    lineHeight: 26,
  },
  doneBtn: {
    borderRadius: 12,
    minWidth: 200,
    marginTop: spacing.sm,
  },
  doneBtnContent: {
    paddingVertical: 10,
  },
  doneBtnLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  countdown: {
    opacity: 0.55,
  },
});

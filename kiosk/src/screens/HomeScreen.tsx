import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Text, TextInput, Button, Card, HelperText, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhoneInput } from '../components/PhoneInput';
import { PartyStepper } from '../components/PartyStepper';
import { ErrorBanner } from '../components/ErrorBanner';
import { api } from '../api/client';
import { Party } from '../types';
import { spacing } from '../theme/theme';
import { validateName, validatePhone } from '../utils/phone';

interface Props {
  onSuccess: (party: Party) => void;
}

const DEFAULT_PARTY_SIZE = 2;

export function HomeScreen({ onSuccess }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [partySize, setPartySize] = useState(DEFAULT_PARTY_SIZE);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Only show inline field errors once the user has attempted to submit
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted ? validateName(name) : null;
  const phoneError = submitted ? validatePhone(phoneDigits) : null;

  const resetForm = useCallback(() => {
    setName('');
    setPhoneDigits('');
    setPartySize(DEFAULT_PARTY_SIZE);
    setApiError(null);
    setSubmitted(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitted(true);
    setApiError(null);

    // Client-side validation gate — don't hit the server if obviously invalid
    if (validateName(name) || validatePhone(phoneDigits)) return;

    setLoading(true);
    try {
      const party = await api.createParty({
        name: name.trim(),
        phone: phoneDigits,
        partySize,
      });
      // Parent unmounts this screen — no need to reset state here
      onSuccess(party);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }, [name, phoneDigits, partySize, onSuccess]);

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <Text
            variant="displaySmall"
            style={[styles.title, { color: theme.colors.primary }]}
            accessibilityRole="header"
          >
            Join the Waitlist
          </Text>
          <Text
            variant="titleLarge"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            We'll text you when your table is ready
          </Text>

          {/* Form card */}
          <Card style={styles.card} elevation={1}>
            <Card.Content style={styles.cardContent}>
              {apiError && (
                <ErrorBanner message={apiError} onRetry={handleSubmit} />
              )}

              {/* Name */}
              <View style={styles.fieldGroup}>
                <TextInput
                  label="Your Name"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  error={!!nameError}
                  disabled={loading}
                  mode="outlined"
                  style={styles.textInput}
                  contentStyle={styles.textInputContent}
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={80}
                  accessibilityLabel="Your name"
                />
                <HelperText type="error" visible={!!nameError} style={styles.helperText}>
                  {nameError ?? ''}
                </HelperText>
              </View>

              {/* Phone */}
              <View style={styles.fieldGroup}>
                <PhoneInput
                  digits={phoneDigits}
                  onDigitsChange={setPhoneDigits}
                  error={phoneError}
                  disabled={loading}
                />
                <HelperText type="error" visible={!!phoneError} style={styles.helperText}>
                  {phoneError ?? ''}
                </HelperText>
              </View>

              {/* Party size */}
              <View style={styles.fieldGroup}>
                <Text
                  variant="titleMedium"
                  style={[styles.stepperLabel, { color: theme.colors.onSurfaceVariant }]}
                >
                  Party Size
                </Text>
                <PartyStepper value={partySize} onChange={setPartySize} disabled={loading} />
              </View>
            </Card.Content>
          </Card>

          {/* Actions */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.primaryBtn}
            contentStyle={styles.primaryBtnContent}
            labelStyle={styles.primaryBtnLabel}
            accessibilityLabel="Join waitlist"
            accessibilityRole="button"
          >
            {loading ? 'Adding You…' : 'Join Waitlist'}
          </Button>

          <Button
            mode="text"
            onPress={resetForm}
            disabled={loading}
            style={styles.secondaryBtn}
            labelStyle={styles.secondaryBtnLabel}
            accessibilityLabel="Start over"
            accessibilityRole="button"
          >
            Start Over
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: 2,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
  },
  textInputContent: {
    fontSize: 22,
    paddingVertical: 6,
  },
  helperText: {
    fontSize: 14,
  },
  stepperLabel: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  primaryBtn: {
    borderRadius: 12,
  },
  primaryBtnContent: {
    paddingVertical: 10,
  },
  primaryBtnLabel: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  secondaryBtn: {
    alignSelf: 'center',
  },
  secondaryBtnLabel: {
    fontSize: 16,
  },
});

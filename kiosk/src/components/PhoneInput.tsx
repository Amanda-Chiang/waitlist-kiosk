import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { formatPhoneDisplay } from '../utils/phone';

interface Props {
  /** Raw digit string (0-10 chars, no formatting). */
  digits: string;
  onDigitsChange: (digits: string) => void;
  error?: string | null;
  disabled?: boolean;
}

/**
 * Controlled phone input that:
 *  - Accepts only digit state internally
 *  - Displays formatted (NXX) NXX-XXXX
 *  - Emits stripped digits via onDigitsChange
 */
export function PhoneInput({ digits, onDigitsChange, error, disabled }: Props) {
  const handleChange = (text: string) => {
    // Strip any non-digit characters the user typed and cap at 10
    const newDigits = text.replace(/\D/g, '').slice(0, 10);
    onDigitsChange(newDigits);
  };

  return (
    <TextInput
      label="Phone Number"
      value={formatPhoneDisplay(digits)}
      onChangeText={handleChange}
      keyboardType="phone-pad"
      returnKeyType="done"
      error={!!error}
      disabled={disabled}
      placeholder="(555) 000-0000"
      mode="outlined"
      style={styles.input}
      contentStyle={styles.content}
      accessibilityLabel="Phone number"
      accessibilityHint="Enter your 10-digit US phone number"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    fontSize: 22,
    paddingVertical: 6,
  },
});

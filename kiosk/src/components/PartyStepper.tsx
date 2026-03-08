import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { MIN_TOUCH } from '../theme/theme';

const MIN_PARTY = 1;
const MAX_PARTY = 20;

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * Large +/- stepper for selecting party size.
 * Buttons are sized for comfortable touch on iPad.
 */
export function PartyStepper({ value, onChange, disabled }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <IconButton
        icon="minus"
        size={32}
        mode="contained"
        onPress={() => onChange(Math.max(MIN_PARTY, value - 1))}
        disabled={disabled || value <= MIN_PARTY}
        accessibilityLabel="Decrease party size"
        accessibilityRole="button"
        style={styles.btn}
      />

      <View style={styles.countWrap} accessible accessibilityLabel={`Party size ${value}`}>
        <Text
          variant="displaySmall"
          style={[styles.count, { color: theme.colors.onBackground }]}
        >
          {value}
        </Text>
        <Text
          variant="labelMedium"
          style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
        >
          {value === 1 ? 'guest' : 'guests'}
        </Text>
      </View>

      <IconButton
        icon="plus"
        size={32}
        mode="contained"
        onPress={() => onChange(Math.min(MAX_PARTY, value + 1))}
        disabled={disabled || value >= MAX_PARTY}
        accessibilityLabel="Increase party size"
        accessibilityRole="button"
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  btn: {
    width: MIN_TOUCH + 16,
    height: MIN_TOUCH + 16,
    borderRadius: (MIN_TOUCH + 16) / 2,
  },
  countWrap: {
    minWidth: 80,
    alignItems: 'center',
  },
  count: {
    fontWeight: '700',
    lineHeight: 56,
  },
  label: {
    marginTop: -4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

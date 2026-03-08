import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

interface Props {
  message: string;
  onRetry?: () => void;
}

/** Inline error banner displayed above the form when an API call fails. */
export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Text style={styles.text} accessible>
        {message}
      </Text>
      {onRetry && (
        <Button
          mode="text"
          onPress={onRetry}
          textColor="#FFFFFF"
          style={styles.retryBtn}
          accessibilityLabel="Retry submission"
        >
          Try Again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#C62828',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  retryBtn: {
    marginLeft: 'auto',
  },
});

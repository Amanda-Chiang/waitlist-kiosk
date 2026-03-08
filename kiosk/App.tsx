import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ConfirmationScreen } from './src/screens/ConfirmationScreen';
import { kioskTheme } from './src/theme/theme';
import { Party } from './src/types';

type Screen = 'home' | 'confirmation';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [confirmedParty, setConfirmedParty] = useState<Party | null>(null);

  const handleSuccess = (party: Party) => {
    setConfirmedParty(party);
    setScreen('confirmation');
  };

  const handleDone = () => {
    setConfirmedParty(null);
    setScreen('home');
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={kioskTheme}>
        <StatusBar style="dark" />
        {screen === 'home' ? (
          <HomeScreen onSuccess={handleSuccess} />
        ) : (
          // confirmedParty is guaranteed non-null when screen === 'confirmation'
          <ConfirmationScreen party={confirmedParty!} onDone={handleDone} />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

import 'fast-text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';

import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/expo';
import Constants from "expo-constants";
import { PrivyElements } from "@privy-io/expo/ui";
import { AppContent } from './src/components/AppContent';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App: React.FC = () => {
  const privyAppId = Constants.expoConfig?.extra?.privyAppId;
  const privyClientId = Constants.expoConfig?.extra?.privyClientId;

  if (!privyAppId || !privyClientId) {
    console.error('Missing Privy App ID');
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <PrivyProvider 
          appId={privyAppId}
          clientId={privyClientId}
        >
          <AppContent />
          <PrivyElements />
        </PrivyProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App; 
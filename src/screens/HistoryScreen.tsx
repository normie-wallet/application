import React from 'react';
import { View, StyleSheet } from 'react-native';
import { USDCTransactions } from '../components/USDCTransactions';
import { usePrivy } from '@privy-io/expo';

export const HistoryScreen: React.FC = () => {
  const { user } = usePrivy();
  const walletAddress = user?.linked_accounts?.[1]?.address;

  return (
    <View style={styles.container}>
      {walletAddress && <USDCTransactions address={walletAddress} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 
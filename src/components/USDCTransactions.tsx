import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TransactionList } from './TransactionList';
import { Transaction, fetchUsdcTransactions } from '../utils/transactions';

interface USDCTransactionsProps {
  address: string;
}

const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const ETHERSCAN_API_KEY = "N5FS2S9UUJ68SX2IGUKKNBF8W8W56A8B9H";

export const USDCTransactions: React.FC<USDCTransactionsProps> = ({ address }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const txData = await fetchUsdcTransactions(address);
        setTransactions(txData);
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Error loading transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [address]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My transactions</Text>
      </View>
      <TransactionList transactions={transactions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
}); 
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TransactionList } from '../components/TransactionList';

const mockTransactions = [
  {
    id: '1',
    type: 'send' as const,
    amount: '-0.5 ETH',
    date: '2024-02-20',
    status: 'completed' as const,
    description: 'Sent to 0x742d...f44e',
    icon: 'arrow-up',
  },
  {
    id: '2',
    type: 'receive' as const,
    amount: '+1.2 ETH',
    date: '2024-02-19',
    status: 'completed' as const,
    description: 'Received from 0x742d...f44e',
    icon: 'arrow-down',
  },
  {
    id: '3',
    type: 'send' as const,
    amount: '-0.3 ETH',
    date: '2024-02-18',
    status: 'pending' as const,
    description: 'Sent to 0x742d...f44e',
    icon: 'arrow-up',
  },
];

export const HistoryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <TransactionList transactions={mockTransactions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
}); 
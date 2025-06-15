import React from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  amount: string;
  type: 'send' | 'receive';
  description: string;
  date: string;
  icon: string;
  recipient?: string;
  sender?: string;
  status: 'completed' | 'pending';
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sections = Object.entries(groupedTransactions).map(([date, data]) => ({
    title: date,
    data,
  }));

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={item.type === 'send' ? 'arrow-up' : 'arrow-down'}
          size={24}
          color={item.type === 'send' ? '#ef4444' : '#22c55e'}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>
          {item.type === 'send' ? 'Sent' : 'Received'}
        </Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amount,
            { color: item.type === 'send' ? '#ef4444' : '#22c55e' },
          ]}
        >
          {item.amount}
        </Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {transactions.length !== 0 ?
      <SectionList
        sections={sections}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      /> : <Text style={{
        padding: 20
      }}>There are no transations yet in your account.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
}); 
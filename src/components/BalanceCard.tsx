import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface BalanceCardProps {
  showBalance: boolean;
  walletData: {
    address: string;
  };
  onToggleBalance: () => void;
}

const maskWalletAddress = (address: string): string => {
  if (!address) return '';
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}...${end}`;
};

export const BalanceCard: React.FC<BalanceCardProps> = ({
  showBalance,
  walletData,
  onToggleBalance,
}) => {
  console.log(walletData);

  return (
    <LinearGradient
      colors={['#7c3aed', '#db2777']}
      style={styles.balanceCard}
    >
      <View style={styles.balanceHeader}>
        <TouchableOpacity onPress={onToggleBalance}>
          <Ionicons
            name={showBalance ? 'eye' : 'eye-off'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.balanceLabel}>Available Balance</Text>
      <Text style={styles.balanceAmount}>
        {showBalance ? '$15,423.87' : '••••••••'}
      </Text>
      <View style={styles.walletInfo}>
        <Text style={styles.walletLabel}>Wallet ID</Text>
        <Text style={styles.walletAddress}>{maskWalletAddress(walletData?.address)}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  balanceHeader: {
    alignItems: 'center',
    textAlign: 'center',
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    alignItems: 'center',
    textAlign: 'center',
  },
  walletInfo: {
    marginTop: 24,
    alignItems: 'center',
    gap: 5,
  },
  walletLabel: {
    color: 'white',
    opacity: 0.7,
    fontSize: 12,
  },
  walletAddress: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 
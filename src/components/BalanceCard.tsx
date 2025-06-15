import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createPublicClient, http, parseAbi } from 'viem';
import { arbitrumSepolia, baseSepolia, sepolia } from 'viem/chains';


const USDC_ADDRESSES = {
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  base: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  arb: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
};
const USDT_SEPOLIA = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
const ERC20_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)"
]);
const SEPOLIA_RPC = "https://1rpc.io/sepolia";
const BASE_RPC = "https://sepolia.base.org";
const ARB_RPC = "https://sepolia-rollup.arbitrum.io/rpc";

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


  const getBalance = async (address: string): Promise<string> => {
    if (!address) return "0.00";

    const clients = {
      sepolia: createPublicClient({ chain: sepolia, transport: http(SEPOLIA_RPC) }),
      base: createPublicClient({ chain: baseSepolia, transport: http(BASE_RPC) }),
      arb: createPublicClient({ chain: arbitrumSepolia, transport: http(ARB_RPC) }),
    };

    const [
      usdcSepolia,
      usdcBase,
      usdcArb,
      usdtSepolia,
    ] = await Promise.all([
      clients.sepolia.readContract({
        address: USDC_ADDRESSES.sepolia as any,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as any],
      }),
      clients.base.readContract({
        address: USDC_ADDRESSES.base as any,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as any],
      }),
      clients.arb.readContract({
        address: USDC_ADDRESSES.arb as any,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as any],
      }),
      clients.sepolia.readContract({
        address: USDT_SEPOLIA as any,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as any],
      }),
    ]);

    // Баланс каждого токена делим на 1e6 и складываем
    const sum =
      Number(usdcSepolia) / 1e6 +
      Number(usdcBase) / 1e6 +
      Number(usdcArb) / 1e6 +
      Number(usdtSepolia) / 1e6;

    // Округляем до 2 знаков
    return sum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

export const BalanceCard: React.FC<BalanceCardProps> = ({
  showBalance,
  walletData,
  onToggleBalance,
}) => {
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
        {showBalance ? getBalance(walletData?.address) : '••••••••'}
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
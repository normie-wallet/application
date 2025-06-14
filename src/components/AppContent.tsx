import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
} from 'react-native';
import { Header } from './Header';
import { BalanceCard } from './BalanceCard';
import { QuickActions } from './QuickActions';
import { BottomNav } from './BottomNav';
import { SendModal } from './SendModal';
import { ReceiveModal } from './ReceiveModal';
import { HistoryScreen } from '../screens/HistoryScreen';
import { TransactionList } from './TransactionList';
import QRScannerScreen from '../screens/QRScannerScreen';
import { ShakeToAction } from '../utils/shakeToAction';
import { TransferConfirmModal } from './TransferConfirmModal';
import { useLogin } from "@privy-io/expo/ui";
import { ProfileSettings } from '../screens/ProfileSettings';
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import {
  createPublicClient,
  encodeFunctionData,
  parseAbi,
  parseUnits,
  http,
} from "viem";
import { sepolia } from "viem/chains";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { sponsorUserOperation } from "@zerodev/sdk";
import { ethers } from "ethers";
const { wallets } = useEmbeddedEthereumWallet();

const ENTRYPOINT = "0x0576a174D229E3cFA37253523E645A78A0C91B57";


export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [sendModalVisible, setSendModalVisible] = useState<boolean>(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState<boolean>(false);
  const [qrScannerVisible, setQrScannerVisible] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [transferConfirmVisible, setTransferConfirmVisible] = useState(false);
  const [transferData, setTransferData] = useState<{
    amount: number;
    recipient: string;
    chainId: number;
    method: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const {user} = usePrivy();
  const { login } = useLogin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  const shakeDetector = useRef<ShakeToAction | null>(null);
  const userData = user?.linked_accounts[0];

  const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const USDT = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";

  const UNISWAP_ROUTER = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
  const ERC20_ABI = parseAbi([
    "function transfer(address,uint256)",
    "function approve(address,uint256)",
    "function balanceOf(address) view returns (uint256)"
  ]);
  const SWAP_ABI = parseAbi([
    "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) returns (uint256)"
  ]);

  const transactions = [
    {
      id: 1,
      type: 'send' as const,
      amount: '-$50.00',
      description: 'Transfer to Elena I.',
      date: 'Today, 10:23 AM',
      icon: 'arrow-up' as const,
      recipient: 'Elena Ivanova',
    },
    {
      id: 2,
      type: 'receive' as const,
      amount: '+$1,250.00',
      description: 'Salary from TechCorp',
      date: 'Today, 9:15 AM',
      icon: 'arrow-down' as const,
      sender: 'TechCorp Inc.',
    },
    {
      id: 3,
      type: 'exchange' as const,
      amount: '-$200.00',
      description: 'Exchange to ETH',
      date: 'Yesterday, 5:45 PM',
      icon: 'swap-horizontal' as const,
      details: '0.08 ETH',
    },
    {
      id: 4,
      type: 'send' as const,
      amount: '-$35.75',
      description: 'Coffee Shop Payment',
      date: 'Yesterday, 11:30 AM',
      icon: 'cafe' as const,
      recipient: 'Urban Brew',
    },
    {
      id: 5,
      type: 'receive' as const,
      amount: '+$420.00',
      description: 'Freelance Project',
      date: 'Jun 9, 2025',
      icon: 'laptop' as const,
      sender: 'DesignStudio',
    },
  ];

  useEffect(() => {
    shakeDetector.current = new ShakeToAction(() => {
      console.log('shake');
    }, {
      threshold: 2.0,
      windowSize: 400,
      minShakes: 2, 
      cooldownTime: 1000, 
    });
    
    shakeDetector.current.start();

    return () => {
      if (shakeDetector.current) {
        shakeDetector.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  }, []);

  const handleSend = (amount: string, recipient: string) => {
    setSendModalVisible(false);
  };

  const parseERC681 = (data: string) => {
    try {
      const url = data.startsWith('ethereum:') ? data.slice(9) : data;
      const [addressPart, rest] = url.split('@');
      if (!rest) throw new Error('Invalid ERC-681 format: missing chainId');
      
      const [chainId, pathAndParams] = rest.split('/');
      if (!pathAndParams) throw new Error('Invalid ERC-681 format: missing path');
      
      const [method, params] = pathAndParams.split('?');
      const searchParams = new URLSearchParams(params);
      
      const result = {
        address: addressPart,
        chainId: parseInt(chainId),
        method,
        amount: 0,
        recipient: '',
        walletId: '',
        walletClient: '',
        // Convert amount from wei to ETH
        amountInEth: 0
      };

      if (method === 'transfer') {
        result.amount = parseInt(searchParams.get('uint256') || '0');
        result.recipient = searchParams.get('address') || '';
      } else {
        result.amount = parseInt(searchParams.get('value') || '0');
        result.recipient = addressPart;
      }

      // Parse additional parameters
      result.walletId = searchParams.get('wallet_id') || '';
      result.walletClient = searchParams.get('wallet_client') || '';
      
      // Convert amount from wei to ETH (1 ETH = 10^18 wei)
      result.amountInEth = result.amount / 1000000; // Since we multiply by 1000000 in QR code

      return result;
    } catch (error) {
      console.error('Error parsing ERC-681 URL:', error);
      return null;
    }
  };

  const handleQRScan = (data: string) => {
    setQrScannerVisible(false);
    
    const parsedData = parseERC681(data);
    if (!parsedData) {
      console.error('Failed to parse QR code data');
      return;
    }

    setTransferData(parsedData);
    setTransferConfirmVisible(true);
    
    validateTransfer(parsedData.amount / 1000000);
  };

  const validateTransfer = async (amount: number): Promise<boolean> => {
    setIsValidating(true);
    setValidationError(null);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const hasEnoughBalance = amount <= 500;
    
    if (!hasEnoughBalance) {
      setValidationError('Insufficient balance');
    }
    
    setIsValidating(false);
    return hasEnoughBalance;
  };

  const handleTransferConfirm = async () => {
    if (!transferData) return;

    setIsLoading(true);
    setValidationError(null);

    try {

      const privyProvider = await wallets[0].getProvider();

      const owner = user?.linked_accounts.find(account => account.type === 'wallet')?.address;
      const recipient = transferData.recipient;
      const amount = transferData.amount.toString();

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http("https://1rpc.io/sepolia"),
      });

      const account = await createKernelAccount(publicClient, {
        entryPoint: {
          address: "0x0576a174D229E3cFA37253523E645A78A0C91B57",
          version: "0.7",
        },
        kernelVersion: "0.3.0",
        eip7702Account: privyProvider as any, 
      });

      const aaClient = createKernelAccountClient({
        account,
        chain: sepolia,
        client: publicClient as any,
        bundlerTransport: http("https://rpc.zerodev.app/api/v3/2ee2e333-dfb9-4617-9763-335c4a7a6b02/chain/11155111"),
      });

      // 1. Проверка баланса USDC
      const usdcBal: bigint = await publicClient.readContract({
        address: USDC,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [account.address],
      });

      const amt = parseUnits(amount, 6);

      // 2. Если хватает USDC — просто transfer
      if (usdcBal >= amt) {
        const tx = await aaClient.sendUserOperation({
          calls: [
            {
              to: USDC,
              data: encodeFunctionData({
                abi: ERC20_ABI,
                functionName: "transfer",
                args: [recipient as any, amt],
              }),
            },
          ],
        });
        setIsLoading(false);
        setTransferConfirmVisible(false);
        return;
      }

      const usdtBal: bigint = await publicClient.readContract({
        address: USDT,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [account.address],
      });

      if (usdtBal > 0n) {
        const approveUSDT = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [UNISWAP_ROUTER, usdtBal],
        });

        const swap = encodeFunctionData({
          abi: SWAP_ABI,
          functionName: "exactInputSingle",
          args: [{
            tokenIn: USDT,
            tokenOut: USDC,
            fee: 3000,
            recipient: account.address,
            amountIn: usdtBal,
            amountOutMinimum: 0n,
            sqrtPriceLimitX96: 0n,
          }],
        });

        const transfer = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [recipient as any, amt],
        });

        await aaClient.sendUserOperation({
          calls: [
            { to: USDT, data: approveUSDT },
            { to: UNISWAP_ROUTER, data: swap },
            { to: USDC, data: transfer },
          ],
        });
        setIsLoading(false);
        setTransferConfirmVisible(false);
        return;
      }

      // 4. Если нет USDT — ошибка
      setValidationError("Not enough USDC or USDT for transfer");

    } catch (e) {
      setValidationError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const renderHomeTab = () => (
    <View style={styles.container}>
      <Header 
        currentDate={currentDate}
        onScanPress={() => setQrScannerVisible(true)}
        onSettingsPress={() => setShowProfileSettings(true)}
        user={userData}
      />
      <BalanceCard
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
        walletData={user?.linked_accounts[1]}
      />
      <QuickActions
        onSend={() => setSendModalVisible(true)}
        onReceive={() => setReceiveModalVisible(true)}
      />
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => setActiveTab('history')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <TransactionList 
        transactions={transactions} 
      />
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'history' && <HistoryScreen />}
      {showProfileSettings && <ProfileSettings onClose={() => setShowProfileSettings(false)} />}
      
      <BottomNav
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onSendPress={() => setSendModalVisible(true)}
      />
      
      <SendModal
        visible={sendModalVisible}
        onClose={() => setSendModalVisible(false)}
        onSend={handleSend}
      />
      <ReceiveModal
        visible={receiveModalVisible}
        onClose={() => setReceiveModalVisible(false)}
        walletData={user?.linked_accounts[1]}
      />
      <QRScannerScreen
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onScan={handleQRScan}
      />
      <TransferConfirmModal
        visible={transferConfirmVisible}
        onClose={() => {
          setTransferConfirmVisible(false);
          setValidationError(null);
        }}
        onConfirm={handleTransferConfirm}
        data={transferData || {
          amount: 0,
          recipient: '',
          chainId: 0,
          method: ''
        }}
        isValidating={isValidating}
        validationError={validationError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 10
  },
  container: {
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 20,
    paddingRight: 20
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#7c3aed',
    fontSize: 14,
  },
}); 
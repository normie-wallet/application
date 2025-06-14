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
import { PrivyUser, useEmbeddedEthereumWallet, usePrivy } from '@privy-io/expo';

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
  const [accountData, setAccountData] = useState<any>(user);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { create } = useEmbeddedEthereumWallet();

  console.log('Account Data:', accountData);
  
  const shakeDetector = useRef<ShakeToAction | null>(null);
  const [userData, setUserData] = useState<any>(accountData?.linked_accounts?.[0]);
  const [walletData, setWalletData] = useState<object | undefined>(user?.linked_accounts[1]);

  // Update userData and walletData when accountData changes
  useEffect(() => {
    if (accountData) {
      console.log('Updating states with new account data:', accountData);
      setUserData(accountData.linked_accounts?.[0]);
      setWalletData(accountData.linked_accounts?.[1]);
      setIsLoading(false);
    }
  }, [accountData]);

  useEffect(() => {
    const createWallet = async () => {
      try {
        setIsLoading(true);
        const createData = await create();
        console.log('Create data:', createData);
        
        // Extract data from user object
        const userData = createData.user;
        console.log('User data:', userData);
        
        // Update states with correct data structure
        setAccountData(userData);
        setUserData(userData.linked_accounts?.[0]);
        setWalletData(userData.linked_accounts?.[1]);
        console.log('Wallet data after creation:', userData.linked_accounts?.[1]);
      } catch (error) {
        // If wallet already exists, use existing user data
        console.log('Using existing user data:', user);
        setAccountData(user);
        setUserData(user?.linked_accounts?.[0]);
        setWalletData(user?.linked_accounts?.[1]);
        console.log('Wallet data from user:', user?.linked_accounts?.[1]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!accountData?.linked_accounts?.[1]) {
      console.log('No wallet found, creating new one...');
      createWallet();
    } else {
      console.log('Using existing wallet data:', accountData.linked_accounts[1]);
      setWalletData(accountData.linked_accounts[1]);
      setIsLoading(false);
    }
  }, []);

  // Log wallet data changes
  useEffect(() => {
    console.log('Wallet data updated:', walletData);
  }, [walletData]);

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
    
    console.log('Transfer confirmed:', transferData);
    
    setTransferConfirmVisible(false);
  };

  const formatDate = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const renderHomeTab = () => (
    <View style={styles.container}>
      <Header
        onSettingsPress={() => setShowProfileSettings(true)}
        user={userData}
        onScanPress={() => setQrScannerVisible(true)}
        loadingWallet={!isLoading && walletData}
        currentDate={formatDate(new Date())}
      />
      {!isLoading ? (
        <>
          <BalanceCard
            showBalance={showBalance}
            walletData={walletData}
            onToggleBalance={() => setShowBalance(!showBalance)}
            currentDate={formatDate(new Date())}
          />
          <QuickActions
            onSend={() => setSendModalVisible(true)}
            onReceive={() => setReceiveModalVisible(true)}
          />
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          </View>
          <TransactionList transactions={transactions} />
        </>
      ) : (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}>
          <Text style={{
            fontSize: 16,
            textAlign: 'center'
          }}>
            {isLoading ? 'Please wait, we\'re setting up a wallet for you...' : 'No wallet data available'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'history' && <HistoryScreen />}
      {showProfileSettings && <ProfileSettings onClose={() => setShowProfileSettings(false)} />}
      
      {!isLoading && walletData && (
        <BottomNav
          activeTab={activeTab}
          onTabPress={setActiveTab}
          onSendPress={() => setSendModalVisible(true)}
        />
      )}
      
      <SendModal
        visible={sendModalVisible}
        onClose={() => setSendModalVisible(false)}
        onSend={handleSend}
      />
      <ReceiveModal
        visible={receiveModalVisible}
        onClose={() => setReceiveModalVisible(false)}
        walletData={walletData}
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
  createWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  createWalletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  createWalletDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 
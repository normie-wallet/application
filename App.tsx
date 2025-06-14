import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as Random from 'expo-random';
import { Header } from './src/components/Header';
import { BalanceCard } from './src/components/BalanceCard';
import { QuickActions } from './src/components/QuickActions';
import { BottomNav } from './src/components/BottomNav';
import { SendModal } from './src/components/SendModal';
import { ReceiveModal } from './src/components/ReceiveModal';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { TransactionList } from './src/components/TransactionList';
import QRScannerScreen from './src/screens/QRScannerScreen';
import { ShakeToAction } from './src/utils/shakeToAction';
import { TransferConfirmModal } from './src/components/TransferConfirmModal';

// Initialize WebBrowser
WebBrowser.maybeCompleteAuthSession();

const App: React.FC = () => {
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
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  const shakeDetector = useRef<ShakeToAction | null>(null);

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

  /**
   * Device shake detection
   */
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

  useEffect(() => {
    // Check for existing auth token on app start
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        setAuthToken(token);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      
      // Here you would typically make an API call to your backend
      // For demo purposes, we'll simulate a successful login
      if (email && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a simple token (in real app, this would come from your backend)
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        
        // Store the token
        await SecureStore.setItemAsync('auth_token', token);
        setAuthToken(token);
        
        Alert.alert('Success', isLogin ? 'Successfully logged in!' : 'Account created successfully!');
        
        // Clear form
        setEmail('');
        setPassword('');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      setAuthToken(null);
      setUserInfo(null);
      Alert.alert('Success', 'Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleSend = (amount: string, recipient: string) => {
    // Handle send logic here
    setSendModalVisible(false);
  };

  const parseERC681 = (data: string) => {
    try {
      // Remove 'ethereum:' prefix if present
      const url = data.startsWith('ethereum:') ? data.slice(9) : data;
      
      // Split into parts: address@chainId/path?params
      const [addressPart, rest] = url.split('@');
      if (!rest) throw new Error('Invalid ERC-681 format: missing chainId');
      
      const [chainId, pathAndParams] = rest.split('/');
      if (!pathAndParams) throw new Error('Invalid ERC-681 format: missing path');
      
      const [method, params] = pathAndParams.split('?');
      const searchParams = new URLSearchParams(params);
      
      // Extract common parameters
      const result = {
        address: addressPart,
        chainId: parseInt(chainId),
        method,
        amount: 0,
        recipient: '',
      };

      // Handle different formats
      if (method === 'transfer') {
        // Format: transfer?address=0x...&uint256=1000000
        result.amount = parseInt(searchParams.get('uint256') || '0');
        result.recipient = searchParams.get('address') || '';
      } else {
        // Format: ?value=1000000
        result.amount = parseInt(searchParams.get('value') || '0');
        result.recipient = addressPart; // In this format, the main address is the recipient
      }

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
    // Start validation immediately
    validateTransfer(parsedData.amount / 1000000);
  };

  // Mock balance validation
  const validateTransfer = async (amount: number): Promise<boolean> => {
    setIsValidating(true);
    setValidationError(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock balance check (for example, if amount > 500, consider it insufficient)
    const hasEnoughBalance = amount <= 500;
    
    if (!hasEnoughBalance) {
      setValidationError('Insufficient balance');
    }
    
    setIsValidating(false);
    return hasEnoughBalance;
  };

  const handleTransferConfirm = async () => {
    if (!transferData) return;
    
    // Here will be the transfer action
    console.log('Transfer confirmed:', transferData);
    
    setTransferConfirmVisible(false);
  };

  const renderAuthForm = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.authContainer}
    >
      <View style={styles.authForm}>
        <Text style={styles.authTitle}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
          style={styles.authButton}
          onPress={handleAuth}
          disabled={isLoading}
        >
          <Text style={styles.authButtonText}>
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.switchAuthButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchAuthText}>
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderHomeTab = () => (
    <View style={styles.container}>
      <Header 
        currentDate={currentDate} 
        onScanPress={() => setQrScannerVisible(true)}
      />
      <BalanceCard
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
      />
      <QuickActions
        onSend={() => setSendModalVisible(true)}
        onReceive={() => setReceiveModalVisible(true)}
      />
      
      {!authToken ? (
        renderAuthForm()
      ) : (
        <View style={styles.authContainer}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>
              Welcome back!
            </Text>
            <Text style={styles.userEmailText}>
              {email}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutButtonText}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'history' && <HistoryScreen />}
      
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '500',
  },
  authContainer: {
    margin: 16,
  },
  authForm: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  authButton: {
    backgroundColor: '#7c3aed',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchAuthButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchAuthText: {
    color: '#7c3aed',
    fontSize: 14,
  },
  userInfoContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  userInfoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App; 
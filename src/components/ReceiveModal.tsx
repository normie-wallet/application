import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Easing,
  BackHandler,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

interface ReceiveModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  visible,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [submittedAmount, setSubmittedAmount] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const qrFadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        handleClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      fadeAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS === 'ios',
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS === 'ios',
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 300,
          useNativeDriver: Platform.OS === 'ios',
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS === 'ios',
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!inputAmount) return;
    
    setSubmittedAmount(parseFloat(inputAmount));
    setShowQR(true);
    Animated.timing(qrFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setShowQR(false);
    qrFadeAnim.setValue(0);
    setInputAmount('');
    setSubmittedAmount(0);
    onClose();
  };

  if (!isVisible && !visible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      hardwareAccelerated
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={handleClose}
          >
            {!showQR && <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.title}>{!submittedAmount && `Receive Money`}</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View>
                  <Text style={styles.label}>Enter payment amount (USD):</Text>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: 'auto'
                  }}>
                    <TextInput
                      style={styles.input}
                      placeholder='0'
                      keyboardType="decimal-pad"
                      value={inputAmount}
                      onChangeText={(text) => {
                        // Remove any non-numeric characters except decimal point
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        
                        // Ensure only one decimal point
                        const parts = cleaned.split('.');
                        if (parts.length > 2) {
                          return;
                        }
                        
                        // Limit to 2 decimal places
                        if (parts[1] && parts[1].length > 2) {
                          return;
                        }
                        
                        setInputAmount(cleaned);
                      }}
                    />
                    <Text style={{
                      fontSize: 30,
                      color: '#7c3aed'
                    }}>$</Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      ...styles.sendButton,
                      marginTop: 20
                    }}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
            </Animated.View> }

              {showQR && (
                <Animated.View
                  style={[
                    styles.qrContainer,
                    styles.modalContent,
                    {
                      opacity: qrFadeAnim,
                      transform: [{
                        scale: qrFadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      }]
                    }
                  ]}
                >
                  <View style={{
                    ...styles.header,
                    position: 'absolute',
                    right: 20,
                    top: 20
                  }}>
                    <Text style={styles.title}>{!submittedAmount && `Receive Money`}</Text>
                    <TouchableOpacity onPress={handleClose}>
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <Text style={{
                    ...styles.receiveAmount,
                  }}>Receive <Text style={{
                    color: '#7c3aed',
                    fontWeight: 500
                  }}>{submittedAmount}$</Text></Text>
                  <QRCode
                    value={`ethereum:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913@8453/transfer?address=0x5DFE0A60d3c27976eb3F1530F8a1CfA4bE2BAD30&uint256=${submittedAmount * 1000000}`}
                    size={200}
                  />
                </Animated.View>
              )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 250,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  receiveAmount: {
    fontSize: 40,
    marginBottom: 40,
    marginTop: 0
  },
  qrCode: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 232,
    height: 232,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  copyButton: {
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 8,
    padding: 12,
  },
  actionText: {
    color: '#7c3aed',
    marginLeft: 8,
    fontSize: 14,
  },
  input: {
    borderColor: '#ddd',
    fontSize: 35,
    textAlign: 'center',
  },
  sendButton: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountDisplay: {
    alignItems: 'center',
    marginVertical: 20,
  },
  amountText: {
    fontSize: 35,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
}); 
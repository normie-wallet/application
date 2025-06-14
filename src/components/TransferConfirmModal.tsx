import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransferConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: object,
  isValidating: boolean;
  validationError: string | null;
}

export const TransferConfirmModal: React.FC<TransferConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  data,
  isValidating,
  validationError,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
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
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Confirm Transfer</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amount}>${(data.amount / 1000000).toFixed(2)}</Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>To</Text>
                  <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                    {data.address}
                  </Text>
                </View>
              </View>

              {isValidating && (
                <View style={styles.validationContainer}>
                  <Text style={styles.validationText}>Checking balance...</Text>
                </View>
              )}
            </View>

            <View style={styles.footer}>
              {validationError && (
                <Text style={styles.errorText}>{validationError}</Text>
              )}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (isValidating || validationError) && styles.confirmButtonDisabled
                ]}
                onPress={onConfirm}
                disabled={isValidating || !!validationError}
              >
                <Text style={styles.confirmButtonText}>
                  {isValidating ? 'Checking Balance...' : 'Confirm Transfer'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  content: {
    marginBottom: 20,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  detailsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    maxWidth: '70%',
  },
  footer: {
    marginTop: 20,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#c4b5fd',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  validationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  validationText: {
    color: '#6b7280',
    fontSize: 14,
  },
}); 
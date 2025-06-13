import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onSwap: () => void;
  onBuy: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSend,
  onReceive,
  onSwap,
  onBuy,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionButton} onPress={onSend}>
        <View style={styles.iconContainer}>
          <Ionicons name="arrow-up" size={24} color="#7c3aed" />
        </View>
        <Text style={styles.actionText}>Send</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onReceive}>
        <View style={styles.iconContainer}>
          <Ionicons name="arrow-down" size={24} color="#7c3aed" />
        </View>
        <Text style={styles.actionText}>Receive</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 
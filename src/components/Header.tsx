import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  currentDate: string;
  user: object,
  loadingWallet: object,
  onScanPress: () => void;
  onSettingsPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentDate, 
  user,
  loadingWallet,
  onScanPress, 
  onSettingsPress 
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={24} color="white" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.greetingText} numberOfLines={1} ellipsizeMode="tail">{user?.address}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        {loadingWallet && <TouchableOpacity style={styles.iconButton} onPress={onScanPress}>
          <Ionicons name="qr-code" size={24} color="#7c3aed" />
        </TouchableOpacity>}
        <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    width: 200,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 
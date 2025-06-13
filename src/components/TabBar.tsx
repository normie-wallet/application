import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onSendPress: () => void;
  onReceivePress: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabPress,
  onSendPress,
  onReceivePress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('home')}
      >
        <Ionicons
          name="home"
          size={24}
          color={activeTab === 'home' ? '#7c3aed' : '#666'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('activity')}
      >
        <Ionicons
          name="time"
          size={24}
          color={activeTab === 'activity' ? '#7c3aed' : '#666'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.centerButton}
        onPress={onReceivePress}
      >
        <Ionicons name="arrow-down" size={24} color="#7c3aed" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('cards')}
      >
        <Ionicons
          name="card"
          size={24}
          color={activeTab === 'cards' ? '#7c3aed' : '#666'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress('settings')}
      >
        <Ionicons
          name="settings"
          size={24}
          color={activeTab === 'settings' ? '#7c3aed' : '#666'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 
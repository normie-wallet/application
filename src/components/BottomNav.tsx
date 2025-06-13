import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  onSendPress: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabPress,
  onSendPress,
}) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onTabPress('home')}
      >
        <Ionicons
          name="home"
          size={24}
          color={activeTab === 'home' ? '#7c3aed' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            { color: activeTab === 'home' ? '#7c3aed' : '#666' },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendButton} onPress={onSendPress}>
        <Ionicons name="arrow-up" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => onTabPress('history')}
      >
        <Ionicons
          name="time"
          size={24}
          color={activeTab === 'history' ? '#7c3aed' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            { color: activeTab === 'history' ? '#7c3aed' : '#666' },
          ]}
        >
          History
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 0,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  navButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 1,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
}); 
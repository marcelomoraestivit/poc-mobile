/**
 * NetworkStatusIndicator - Visual indicator for network status
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatusIndicatorProps {
  onStatusChange?: (isConnected: boolean) => void;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  onStatusChange,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      console.log('Network state changed:', {
        isConnected: connected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      });

      setIsConnected(connected);

      // Show indicator when offline
      setShowIndicator(!connected);

      // Notify parent
      if (onStatusChange) {
        onStatusChange(connected);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onStatusChange]);

  if (!showIndicator) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isConnected ? '🟢 Online' : '🔴 Offline - Working offline'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default NetworkStatusIndicator;

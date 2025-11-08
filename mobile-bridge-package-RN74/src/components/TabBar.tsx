/**
 * TabBar - Native bottom tab bar component
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  onPress: () => void;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId }) => {
  const insets = useSafeAreaInsets();

  // Debug: Log badge values
  React.useEffect(() => {
  }, [tabs, activeTabId]);

  if (!tabs || tabs.length === 0) {
    console.warn('[TabBar] No tabs provided!');
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={tab.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {tab.icon}
              </Text>
              {tab.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    zIndex: 1000,
    elevation: 8, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.4,
    color: '#757575',
  },
  activeIcon: {
    opacity: 1,
    color: '#1a1a1a',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#E03131',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
});

export default TabBar;

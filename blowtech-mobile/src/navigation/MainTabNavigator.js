import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ArrowUpRight, QrCode, BarChart2, Bell } from 'lucide-react-native';

import DashboardScreen from '../screens/DashboardScreen';
import SendMoneyScreen from '../screens/SendMoneyScreen';
import ReceiveMoneyScreen from '../screens/ReceiveMoneyScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route }) {
  // Pass the user parameter from login
  const { user } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // We will render custom labels inside the icon component to match design perfectly
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={DashboardScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Home} label="Home" />
          )
        }}
      />
      <Tab.Screen 
        name="SendTab" 
        component={SendMoneyScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={ArrowUpRight} label="Send" />
          )
        }}
      />
      <Tab.Screen 
        name="QRTab" 
        component={ReceiveMoneyScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={QrCode} label="QR" />
          )
        }}
      />
      <Tab.Screen 
        name="StatsTab" 
        component={AnalyticsScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={BarChart2} label="Stats" />
          )
        }}
      />
      <Tab.Screen 
        name="AlertsTab" 
        component={NotificationsScreen} 
        initialParams={{ user }}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Bell} label="Alerts" />
          )
        }}
      />
    </Tab.Navigator>
  );
}

const TabIcon = ({ focused, icon: Icon, label }) => {
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
        <Icon size={22} color={focused ? '#ffffff' : '#9ca3af'} strokeWidth={focused ? 2.5 : 2} />
      </View>
      <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111827',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 85 : 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconWrapper: {
    backgroundColor: '#8b5cf6', // Purple active state
  },
  tabLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#ffffff',
    fontWeight: '600',
  }
});

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SignScreen } from '../screens/SignScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PrescriptionCreateScreen } from '../screens/PrescriptionCreateScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  PrescriptionCreate: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AppStackParamList>();

const ACTIVE_COLOR   = '#5C6BC0';
const INACTIVE_COLOR = '#9E9E9E';

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: ACTIVE_COLOR,
      tabBarInactiveTintColor: INACTIVE_COLOR,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Home',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Stats"
      component={StatsScreen}
      options={{
        title: 'Stats',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Sign"
      component={SignScreen}
      options={{
        title: 'Sign',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'create' : 'create-outline'} size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: 'Settings',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs"           component={MainTabs} />
    <Stack.Screen name="PrescriptionCreate" component={PrescriptionCreateScreen} />
  </Stack.Navigator>
);

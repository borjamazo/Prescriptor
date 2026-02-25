import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ActiveBlocksScreen } from '../screens/ActiveBlocksScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { PrescriptionCreateScreen } from '../screens/PrescriptionCreateScreen';
import { PrescriptionBlocksScreen } from '../screens/PrescriptionBlocksScreen';
import { HelpCenterScreen } from '../screens/HelpCenterScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  Account: undefined;
  PrescriptionCreate: undefined;
  PrescriptionBlocks: undefined;
  HelpCenter: undefined;
  TermsOfService: undefined;
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
        title: 'Inicio',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Stats"
      component={StatsScreen}
      options={{
        title: 'Estadísticas',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Blocks"
      component={ActiveBlocksScreen}
      options={{
        title: 'Talonarios',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'documents' : 'documents-outline'} size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: 'Ajustes',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs"            component={MainTabs} />
    <Stack.Screen name="Account"             component={AccountScreen} />
    <Stack.Screen name="PrescriptionCreate"  component={PrescriptionCreateScreen} />
    <Stack.Screen name="PrescriptionBlocks"  component={PrescriptionBlocksScreen} />
    <Stack.Screen name="HelpCenter"          component={HelpCenterScreen} />
    <Stack.Screen name="TermsOfService"      component={TermsOfServiceScreen} />
  </Stack.Navigator>
);

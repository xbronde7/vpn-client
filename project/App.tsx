import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider } from './src/context/AppContext';
import { VPNProvider } from './src/context/VPNContext';
import { COLORS } from './src/utils/constants';

import HomeScreen from './src/screens/HomeScreen';
import ConfigsScreen from './src/screens/ConfigsScreen';
import AddConfigScreen from './src/screens/AddConfigScreen';
import ConfigDetailScreen from './src/screens/ConfigDetailScreen';
import StatsScreen from './src/screens/StatsScreen';
import LogsScreen from './src/screens/LogsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplitTunnelScreen from './src/screens/SplitTunnelScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ConfigStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { color: COLORS.text },
      }}
    >
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'VPN Client' }}
      />
    </HomeStack.Navigator>
  );
}

function ConfigStackScreen() {
  return (
    <ConfigStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { color: COLORS.text },
      }}
    >
      <ConfigStack.Screen 
        name="ConfigsList" 
        component={ConfigsScreen} 
        options={{ title: 'Конфигурации' }}
      />
      <ConfigStack.Screen 
        name="AddConfig" 
        component={AddConfigScreen} 
        options={{ title: 'Добавить конфиг' }}
      />
      <ConfigStack.Screen 
        name="ConfigDetail" 
        component={ConfigDetailScreen} 
        options={{ title: 'Детали конфигурации' }}
      />
    </ConfigStack.Navigator>
  );
}

const SettingStack = createStackNavigator();

function SettingStackScreen() {
  return (
    <SettingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { color: COLORS.text },
      }}
    >
      <SettingStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Настройки' }}
      />
      <SettingStack.Screen
        name="SplitTunnel"
        component={SplitTunnelScreen}
        options={{ title: 'Избирательное туннелирование' }}
      />
    </SettingStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <VPNProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: COLORS.primary,
                background: COLORS.background,
                card: COLORS.surface,
                text: COLORS.text,
                border: COLORS.border,
                notification: COLORS.primary,
              },
            }}
          >
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: keyof typeof Ionicons.glyphMap = 'home';
                  
                  if (route.name === 'Home') {
                    iconName = focused ? 'shield' : 'shield-outline';
                  } else if (route.name === 'Configs') {
                    iconName = focused ? 'list' : 'list-outline';
                  } else if (route.name === 'Stats') {
                    iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                  } else if (route.name === 'Logs') {
                    iconName = focused ? 'document-text' : 'document-text-outline';
                  } else if (route.name === 'Settings') {
                    iconName = focused ? 'settings' : 'settings-outline';
                  }
                  
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                  backgroundColor: COLORS.surface,
                  borderTopColor: COLORS.border,
                },
                headerShown: false,
              })}
            >
              <Tab.Screen name="Home" component={HomeStackScreen} options={{ title: 'Главная' }} />
              <Tab.Screen name="Configs" component={ConfigStackScreen} options={{ title: 'Конфиги' }} />
              <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Статистика' }} />
              <Tab.Screen name="Logs" component={LogsScreen} options={{ title: 'Логи' }} />
              <Tab.Screen name="Settings" component={SettingStackScreen} options={{ title: 'Настройки' }} />
            </Tab.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
        </VPNProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

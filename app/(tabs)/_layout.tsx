import { Tabs } from 'expo-router';
import { Home, Search, User, Plus, Bell } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { Colors } from '@/constants/colors';
import AuthGuard from '@/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textLight,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            paddingTop: 12,
            paddingBottom: 28,
            height: 85,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => <Plus size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="browse"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => <Search size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => <Bell size={24} color={color} />,
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => <User size={24} color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
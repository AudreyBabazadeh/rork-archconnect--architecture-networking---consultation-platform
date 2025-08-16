import { Tabs } from 'expo-router';
import { Home, Search, MessageCircle, User, Plus, Bell } from 'lucide-react-native';
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
          name="browse"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => <Search size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => <MessageCircle size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#1e3a8a',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Plus size={24} color={Colors.white} />
              </View>
            ),
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
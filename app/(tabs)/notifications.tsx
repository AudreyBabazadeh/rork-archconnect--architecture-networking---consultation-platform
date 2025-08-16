import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Notifications',
        }} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>This page has been cleared and is ready for new content</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
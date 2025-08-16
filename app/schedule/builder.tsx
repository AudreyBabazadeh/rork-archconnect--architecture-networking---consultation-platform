import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function ScheduleBuilderScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Schedule Builder',
          headerBackTitle: 'Back',
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Schedule Builder</Text>
          <Text style={styles.placeholderText}>
            This page will contain the schedule builder functionality.
          </Text>
          <Text style={styles.placeholderSubtext}>
            Users will be able to view and manage their full schedule with all accepted meetings and bookings.
          </Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
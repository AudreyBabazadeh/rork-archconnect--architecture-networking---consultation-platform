import { router } from 'expo-router';
import { ArrowRight, BookOpen, TrendingUp, Heart } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
        
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>Welcome to Archal</Text>
          <Text style={styles.subtitle}>
            Connect, learn, and grow with a community that cares about your success
          </Text>
        </View>

        {/* Key Messages */}
        <View style={styles.keyMessages}>
          <View style={styles.messageCard}>
            <View style={styles.messageIcon}>
              <TrendingUp size={20} color="#1A1A1A" />
            </View>
            <Text style={styles.messageTitle}>Share your expertise</Text>
          </View>

          <View style={styles.messageCard}>
            <View style={styles.messageIcon}>
              <Heart size={20} color="#1A1A1A" />
            </View>
            <Text style={styles.messageTitle}>Support the next generation</Text>
          </View>

          <View style={styles.messageCard}>
            <View style={styles.messageIcon}>
              <BookOpen size={20} color="#1A1A1A" />
            </View>
            <Text style={styles.messageTitle}>Learn from those ahead of you</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/signup')}
            testID="signup-button"
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/signin')}
            testID="signin-button"
          >
            <Text style={styles.secondaryButtonText}>Already have an account?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 20,
    fontWeight: '400' as const,
  },
  keyMessages: {
    gap: 20,
    paddingVertical: 40,
  },
  messageCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 0,
    borderLeftWidth: 3,
    borderLeftColor: '#1A1A1A',
  },
  messageIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 0,
  },
  messageTitle: {
    fontSize: 19,
    fontWeight: '500' as const,
    color: '#374151',
    flex: 1,
    lineHeight: 28,
  },
  buttons: {
    gap: 16,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
});
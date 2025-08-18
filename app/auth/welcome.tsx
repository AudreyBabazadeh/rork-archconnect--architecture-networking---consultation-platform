import { router } from 'expo-router';
import { ArrowRight, BookOpen, TrendingUp, Heart } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.title}>Welcome to Arcal</Text>
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
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '400' as const,
  },
  keyMessages: {
    gap: 16,
    paddingVertical: 40,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
});
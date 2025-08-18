import { router } from 'expo-router';
import { ArrowRight, BookOpen, TrendingUp, Heart } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Icon component matching the app icon
const AppIcon = () => (
  <View style={styles.iconContainer}>
    <View style={styles.iconBackground}>
      {/* Person helping another person up steps */}
      <View style={styles.iconContent}>
        {/* First person (helper) */}
        <View style={styles.person1}>
          <View style={styles.head1} />
          <View style={styles.body1} />
          <View style={styles.arm1} />
        </View>
        {/* Second person (being helped) */}
        <View style={styles.person2}>
          <View style={styles.head2} />
          <View style={styles.body2} />
          <View style={styles.arm2} />
        </View>
        {/* Steps */}
        <View style={styles.steps}>
          <View style={styles.step1} />
          <View style={styles.step2} />
          <View style={styles.step3} />
        </View>
      </View>
    </View>
  </View>
);

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}>
        {/* App Icon at top */}
        <View style={styles.topIconContainer}>
          <AppIcon />
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
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
  topIconContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
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
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
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
    fontWeight: '400',
  },
  keyMessages: {
    marginTop: 60,
    marginBottom: 60,
    gap: 16,
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
    color: '#6B7280',
  },
  // App Icon Styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContent: {
    width: 50,
    height: 40,
    position: 'relative',
  },
  // Steps
  steps: {
    position: 'absolute',
    bottom: 0,
    left: 5,
    right: 5,
  },
  step1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 12,
    height: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },
  step2: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    width: 12,
    height: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },
  step3: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    width: 12,
    height: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },
  // Person 1 (helper)
  person1: {
    position: 'absolute',
    left: 8,
    top: 0,
  },
  head1: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    marginBottom: 2,
  },
  body1: {
    width: 8,
    height: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginLeft: -1,
  },
  arm1: {
    position: 'absolute',
    top: 8,
    right: -6,
    width: 8,
    height: 1.5,
    backgroundColor: '#1A1A1A',
    transform: [{ rotate: '-20deg' }],
  },
  // Person 2 (being helped)
  person2: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  head2: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    marginBottom: 2,
  },
  body2: {
    width: 8,
    height: 10,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginLeft: -1,
  },
  arm2: {
    position: 'absolute',
    top: 8,
    left: -6,
    width: 8,
    height: 1.5,
    backgroundColor: '#1A1A1A',
    transform: [{ rotate: '20deg' }],
  },
});
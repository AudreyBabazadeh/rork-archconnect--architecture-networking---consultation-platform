import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, BookOpen, TrendingUp, Heart } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <Image 
              source={{ uri: 'https://r2-pub.rork.com/generated-images/e85d2b63-236d-4cc7-bf94-1ad28d87277a.png' }}
              style={styles.heroIcon}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to Arcal</Text>
            <Text style={styles.subtitle}>
              Connect, learn, and grow with a community that cares about your success
            </Text>
          </View>

          {/* Key Messages */}
          <View style={styles.keyMessages}>
            <View style={styles.messageCard}>
              <View style={styles.messageIcon}>
                <TrendingUp size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.messageTitle}>Share your expertise</Text>
            </View>

            <View style={styles.messageCard}>
              <View style={styles.messageIcon}>
                <Heart size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.messageTitle}>Support the next generation</Text>
            </View>

            <View style={styles.messageCard}>
              <View style={styles.messageIcon}>
                <BookOpen size={24} color={Colors.secondary} />
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
              <ArrowRight size={18} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/signin')}
              testID="signin-button"
            >
              <Text style={styles.secondaryButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Join a supportive community of learners and mentors
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
    tintColor: Colors.white,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  keyMessages: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  messageIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 101, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  buttons: {
    gap: 16,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
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
    color: Colors.white,
    opacity: 0.9,
  },
  footer: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '500',
  },
});
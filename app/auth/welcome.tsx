import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Building2, Users, Star, ArrowRight, BookOpen, TrendingUp, Heart } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <Building2 size={48} color={Colors.white} />
            </View>
            <Text style={styles.title}>Arcal</Text>
            <Text style={styles.tagline}>
              Where Knowledge Meets Opportunity
            </Text>
            <Text style={styles.subtitle}>
              Connect with experts, share insights, and grow together in a global professional community
            </Text>
          </View>

          {/* Key Messages */}
          <View style={styles.keyMessages}>
            <View style={styles.messageCard}>
              <View style={styles.messageIcon}>
                <TrendingUp size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.messageTitle}>Share your expertise</Text>
              <Text style={styles.messageText}>
                Monetize your knowledge and help others succeed
              </Text>
            </View>

            <View style={styles.messageCard}>
              <View style={styles.messageIcon}>
                <Heart size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.messageTitle}>Support the next generation</Text>
              <Text style={styles.messageText}>
                Guide emerging professionals on their journey
              </Text>
            </View>

            <View style={styles.messageCard}>
              <View style={styles.messageIcon}>
                <BookOpen size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.messageTitle}>Learn from those ahead of you</Text>
              <Text style={styles.messageText}>
                Access insights from industry leaders and experts
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Users size={20} color={Colors.white} />
              <Text style={styles.featureText}>
                Global network of professionals
              </Text>
            </View>
            <View style={styles.feature}>
              <Star size={20} color={Colors.white} />
              <Text style={styles.featureText}>
                Expert consultation & mentorship
              </Text>
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
            Join thousands of professionals worldwide
          </Text>
        </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
    opacity: 0.95,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.85,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  keyMessages: {
    marginBottom: 40,
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  features: {
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.white,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  buttons: {
    gap: 12,
    marginBottom: 32,
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
    opacity: 0.7,
    fontWeight: '500',
  },
});
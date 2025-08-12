import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Building2, Users, Star, ArrowRight } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Building2 size={60} color={Colors.white} />
            <Text style={styles.title}>Arcal</Text>
            <Text style={styles.subtitle}>
              Connect with experts worldwide
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Users size={24} color={Colors.white} />
              <Text style={styles.featureText}>
                Network with students & professors globally
              </Text>
            </View>
            <View style={styles.feature}>
              <Star size={24} color={Colors.white} />
              <Text style={styles.featureText}>
                Get expert consultation on your projects
              </Text>
            </View>
            <View style={styles.feature}>
              <Building2 size={24} color={Colors.white} />
              <Text style={styles.featureText}>
                Showcase your portfolio & earn income
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/auth/signup')}
              testID="signup-button"
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <ArrowRight size={20} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/signin')}
              testID="signin-button"
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Join thousands of professionals
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  features: {
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.white,
    marginLeft: 16,
    flex: 1,
    lineHeight: 22,
  },
  buttons: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 8,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  footer: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
});
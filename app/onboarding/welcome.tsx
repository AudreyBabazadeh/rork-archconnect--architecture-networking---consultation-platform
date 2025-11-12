import { router } from 'expo-router';
import { UserCircle, Sparkles } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  
  const handleSetUpNow = () => {
    router.push('/profile/edit');
  };

  const handleDoLater = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <UserCircle size={80} color={Colors.primary} strokeWidth={1.5} />
            <View style={styles.sparkleIcon}>
              <Sparkles size={28} color={Colors.accent} fill={Colors.accent} />
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Archal</Text>
          <Text style={styles.subtitle}>
            Set up your profile to get discovered by mentors and mentees in the architecture community
          </Text>
          
          <View style={styles.benefitsList}>
            <BenefitItem text="Showcase your work and expertise" />
            <BenefitItem text="Connect with the right people" />
            <BenefitItem text="Build your professional presence" />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSetUpNow}
            testID="setup-now-button"
          >
            <Text style={styles.primaryButtonText}>Set Up Profile Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDoLater}
            testID="do-later-button"
          >
            <Text style={styles.secondaryButtonText}>I&apos;ll Do This Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textLight,
  },
});

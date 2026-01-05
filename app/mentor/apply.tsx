import { router, Stack } from 'expo-router';
import { Award, CheckCircle, ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function MentorApplicationScreen() {
  const { applyForMentor } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      await applyForMentor();
      router.replace('/mentor/pending');
    } catch (error) {
      console.error('Error applying for mentor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Award,
      title: 'Curated Community',
      description: 'Join a selective group of architecture professionals committed to excellence',
    },
    {
      icon: CheckCircle,
      title: 'Professional Recognition',
      description: 'Build your reputation through verified mentorship and student success',
    },
    {
      icon: Award,
      title: 'Flexible Engagement',
      description: 'Set your own availability, rates, and areas of expertise',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Become a Mentor',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Award size={48} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Join Archal&apos;s Mentor Network</Text>
          <Text style={styles.subtitle}>
            Share your expertise with the next generation of architects and designers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Expect</Text>
          <Text style={styles.sectionText}>
            Our mentor network is carefully curated to ensure quality and meaningful connections. 
            After you apply, our team will review your profile and experience.
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Icon size={24} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.processSection}>
          <Text style={styles.sectionTitle}>Application Process</Text>
          
          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Submit Application</Text>
              <Text style={styles.stepDescription}>
                We&apos;ll review your profile, experience, and areas of expertise
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review Period</Text>
              <Text style={styles.stepDescription}>
                Our team evaluates your fit within the mentor community
              </Text>
            </View>
          </View>

          <View style={styles.processStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Welcome & Setup</Text>
              <Text style={styles.stepDescription}>
                Once approved, set your availability, rates, and start connecting
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Who We&apos;re Looking For</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <CheckCircle size={20} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.requirementText}>
                Professional experience in architecture or design
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <CheckCircle size={20} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.requirementText}>
                Passion for teaching and supporting students
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <CheckCircle size={20} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.requirementText}>
                Commitment to quality mentorship and engagement
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.applyButton, isSubmitting && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Text style={styles.applyButtonText}>Submit Application</Text>
              <ArrowRight size={20} color={Colors.white} strokeWidth={2} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By submitting, you agree to maintain professional standards and contribute 
          positively to the Archal community.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  processSection: {
    marginBottom: 32,
  },
  processStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  requirementsSection: {
    marginBottom: 32,
  },
  requirementsList: {
    gap: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  disclaimer: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

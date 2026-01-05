import { router, Stack } from 'expo-router';
import { Clock, CheckCircle, Sparkles, ArrowRight } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function MentorPendingScreen() {
  const { user } = useAuth();

  const reviewItems = [
    {
      icon: CheckCircle,
      title: 'Profile & Credentials',
      description: 'Reviewing your professional background and experience',
    },
    {
      icon: Sparkles,
      title: 'Expertise Alignment',
      description: 'Evaluating your areas of specialization',
    },
    {
      icon: CheckCircle,
      title: 'Community Fit',
      description: 'Ensuring alignment with our mentorship values',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Application Status',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerBackVisible: false,
        }}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <Clock size={32} color={Colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.statusTitle}>Application Under Review</Text>
          <Text style={styles.statusSubtitle}>
            Your application to join the Archal mentor network is being carefully reviewed by our team
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Application Date</Text>
            <Text style={styles.infoValue}>
              {user?.mentorApplicationDate 
                ? new Date(user.mentorApplicationDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })
                : 'Just now'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>In Review</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Happens Next</Text>
          <Text style={styles.sectionText}>
            Our team is carefully evaluating your application to ensure the best fit for both you and our student community. This process helps us maintain the high quality of mentorship that Archal is known for.
          </Text>
        </View>

        <View style={styles.reviewItemsContainer}>
          <Text style={styles.reviewTitle}>Currently Reviewing</Text>
          {reviewItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.reviewItem}>
                <View style={styles.reviewIconContainer}>
                  <Icon size={20} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewItemTitle}>{item.title}</Text>
                  <Text style={styles.reviewItemDescription}>{item.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Typical Timeline</Text>
          <View style={styles.timelineCard}>
            <Text style={styles.timelineText}>
              Most applications are reviewed within <Text style={styles.timelineHighlight}>3-5 business days</Text>. You will receive a notification once a decision has been made.
            </Text>
          </View>
        </View>

        <View style={styles.whileWaitingSection}>
          <Text style={styles.sectionTitle}>While You Wait</Text>
          <View style={styles.suggestionCard}>
            <Sparkles size={24} color={Colors.primary} strokeWidth={1.5} />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>Complete Your Profile</Text>
              <Text style={styles.suggestionDescription}>
                A complete profile increases your chances of approval. Consider adding portfolio pieces and refining your expertise areas.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Return to Profile</Text>
          <ArrowRight size={18} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>
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
    paddingTop: 20,
  },
  statusBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
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
  reviewItemsContainer: {
    marginBottom: 32,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  reviewItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reviewItemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  timelineSection: {
    marginBottom: 32,
  },
  timelineCard: {
    backgroundColor: Colors.primaryLight + '10',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  timelineText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  timelineHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  whileWaitingSection: {
    marginBottom: 32,
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  suggestionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});

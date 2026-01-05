import { router, Stack } from 'expo-router';
import { Clock, CheckCircle, Sparkles, ArrowRight, Award, Users, Heart } from 'lucide-react-native';
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
      title: 'Professional Background',
      description: 'Understanding your unique experience and perspective',
      status: 'active',
    },
    {
      icon: Sparkles,
      title: 'Expertise & Vision',
      description: 'Exploring how your knowledge aligns with student needs',
      status: 'active',
    },
    {
      icon: Heart,
      title: 'Mentorship Approach',
      description: 'Considering your teaching style and values',
      status: 'active',
    },
  ];

  const networkHighlights = [
    {
      icon: Award,
      title: 'Curated Excellence',
      description: 'Join a selective network of industry-leading professionals',
    },
    {
      icon: Users,
      title: 'Meaningful Impact',
      description: 'Guide students who are genuinely invested in their growth',
    },
    {
      icon: Sparkles,
      title: 'Personalized Support',
      description: 'Receive dedicated resources to succeed as a mentor',
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
          <Text style={styles.statusTitle}>You&apos;re Being Considered</Text>
          <Text style={styles.statusSubtitle}>
            Thank you for your interest in joining Archal&apos;s mentor network. Our team is thoughtfully reviewing your application to ensure the best match for both you and our community.
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
          <Text style={styles.sectionTitle}>Why This Matters</Text>
          <Text style={styles.sectionText}>
            We thoughtfully review each application to build a mentor network where expertise meets genuine passion for teaching. This careful selection process ensures meaningful connections and lasting impact for both mentors and students.
          </Text>
        </View>

        <View style={styles.reviewItemsContainer}>
          <Text style={styles.reviewTitle}>What We&apos;re Exploring</Text>
          <Text style={styles.reviewSubtitle}>
            Our team is getting to know your unique strengths and how they align with our community
          </Text>
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
                <View style={styles.activeIndicator}>
                  <View style={styles.pulsingDot} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.networkSection}>
          <Text style={styles.sectionTitle}>What You&apos;re Joining</Text>
          <Text style={styles.networkIntro}>
            If approved, you&apos;ll become part of something special
          </Text>
          {networkHighlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={index} style={styles.networkItem}>
                <View style={styles.networkIconContainer}>
                  <Icon size={20} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.networkContent}>
                  <Text style={styles.networkItemTitle}>{item.title}</Text>
                  <Text style={styles.networkItemDescription}>{item.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.whileWaitingSection}>
          <Text style={styles.sectionTitle}>In The Meantime</Text>
          <View style={styles.suggestionCard}>
            <Sparkles size={24} color={Colors.primary} strokeWidth={1.5} />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>Strengthen Your Application</Text>
              <Text style={styles.suggestionDescription}>
                Consider enriching your profile with portfolio work, detailed expertise areas, or insights about your mentorship philosophy. A complete profile helps us understand your unique value.
              </Text>
            </View>
          </View>
          
          <View style={styles.notificationNote}>
            <Text style={styles.notificationText}>
              You&apos;ll receive a notification once our review is complete. Thank you for your patience as we ensure the right fit.
            </Text>
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
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  activeIndicator: {
    marginLeft: 12,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 0.7,
  },
  networkSection: {
    marginBottom: 32,
  },
  networkIntro: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  networkItem: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: Colors.primaryLight + '08',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '15',
  },
  networkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  networkContent: {
    flex: 1,
  },
  networkItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  networkItemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
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
  notificationNote: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
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

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Star, TrendingUp, Calendar, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { LoyaltyBadge } from '@/components/LoyaltyBadge';

interface BadgeStatus {
  currentBadge: 'none' | 'silver' | 'gold';
  currentYear: number;
  sessionsCompleted: number;
  sessionsRequired: number;
  yearsSinceStart: number;
  feePercentage: number;
  nextBadgeRequirements?: {
    badge: 'silver' | 'gold';
    sessionsNeeded: number;
    timeRemaining: string;
  };
  maintenanceInfo?: {
    sessionsThisYear: number;
    sessionsNeeded: number;
    yearEnd: string;
  };
}

export default function StatusScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to view your status</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mock badge status calculation - in real app this would come from backend
  const getBadgeStatus = (): BadgeStatus => {
    const accountAge = new Date().getFullYear() - new Date(user.createdAt).getFullYear();
    const totalSessions = (user as any).totalConsultations || 0;
    
    // Simulate current year progress
    const currentYearSessions = Math.min(totalSessions, 8); // Mock current year sessions
    
    if (accountAge >= 2 && totalSessions >= 15) {
      // Gold badge holder
      return {
        currentBadge: 'gold',
        currentYear: 2,
        sessionsCompleted: currentYearSessions,
        sessionsRequired: 10,
        yearsSinceStart: accountAge,
        feePercentage: 7,
        maintenanceInfo: {
          sessionsThisYear: currentYearSessions,
          sessionsNeeded: Math.max(0, 10 - currentYearSessions),
          yearEnd: 'December 31, 2025'
        }
      };
    } else if (accountAge >= 1 && totalSessions >= 5) {
      // Silver badge holder
      return {
        currentBadge: 'silver',
        currentYear: accountAge >= 2 ? 2 : 1,
        sessionsCompleted: currentYearSessions,
        sessionsRequired: accountAge >= 2 ? 10 : 5,
        yearsSinceStart: accountAge,
        feePercentage: 9,
        nextBadgeRequirements: accountAge >= 2 ? {
          badge: 'gold',
          sessionsNeeded: Math.max(0, 10 - currentYearSessions),
          timeRemaining: `${12 - new Date().getMonth()} months remaining`
        } : undefined
      };
    } else {
      // No badge yet
      const sessionsNeeded = accountAge >= 1 ? Math.max(0, 5 - totalSessions) : 5;
      const timeRemaining = accountAge >= 1 ? 
        `${12 - new Date().getMonth()} months remaining` : 
        `${12 - accountAge * 12 - new Date().getMonth()} months remaining`;
      
      return {
        currentBadge: 'none',
        currentYear: 1,
        sessionsCompleted: totalSessions,
        sessionsRequired: 5,
        yearsSinceStart: accountAge,
        feePercentage: 12, // Standard fee
        nextBadgeRequirements: {
          badge: 'silver',
          sessionsNeeded,
          timeRemaining
        }
      };
    }
  };

  const badgeStatus = getBadgeStatus();
  const progressPercentage = (badgeStatus.sessionsCompleted / badgeStatus.sessionsRequired) * 100;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>My Status</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Current Badge Status */}
        <View style={styles.badgeCard}>
          <View style={styles.badgeHeader}>
            <Text style={styles.cardTitle}>Current Badge Status</Text>
            {badgeStatus.currentBadge !== 'none' && (
              <View style={styles.badgeContainer}>
                <LoyaltyBadge badge={badgeStatus.currentBadge} size={32} />
              </View>
            )}
          </View>
          
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeTitle}>
              {badgeStatus.currentBadge === 'none' ? 'No Badge' : 
               badgeStatus.currentBadge === 'silver' ? 'Silver Badge' : 'Gold Badge'}
            </Text>
            <Text style={styles.badgeSubtitle}>
              Platform fee: {badgeStatus.feePercentage}%
            </Text>
          </View>

          {badgeStatus.currentBadge !== 'none' && (
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Benefits:</Text>
              <Text style={styles.benefitText}>• Reduced platform fee ({badgeStatus.feePercentage}%)</Text>
              <Text style={styles.benefitText}>• Priority support</Text>
              <Text style={styles.benefitText}>• Enhanced profile visibility</Text>
              {badgeStatus.currentBadge === 'gold' && (
                <Text style={styles.benefitText}>• Premium consultant badge</Text>
              )}
            </View>
          )}
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Year {badgeStatus.currentYear} Progress</Text>
          </View>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {badgeStatus.sessionsCompleted}/{badgeStatus.sessionsRequired} sessions completed
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[styles.progressBarFill, { width: `${Math.min(progressPercentage, 100)}%` }]} 
              />
            </View>
          </View>
          
          {badgeStatus.sessionsCompleted < badgeStatus.sessionsRequired && (
            <Text style={styles.progressNote}>
              Complete {badgeStatus.sessionsRequired - badgeStatus.sessionsCompleted} more sessions to 
              {badgeStatus.currentBadge === 'none' ? 'earn Silver badge' : 
               badgeStatus.currentBadge === 'silver' ? 'maintain Silver badge' : 'maintain Gold badge'}
            </Text>
          )}
        </View>

        {/* Next Badge Requirements */}
        {badgeStatus.nextBadgeRequirements && (
          <View style={styles.requirementsCard}>
            <View style={styles.requirementsHeader}>
              <Star size={20} color={Colors.secondary} />
              <Text style={styles.cardTitle}>
                {badgeStatus.nextBadgeRequirements.badge === 'silver' ? 'Silver' : 'Gold'} Badge Requirements
              </Text>
            </View>
            
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.requirementText}>
                  {badgeStatus.nextBadgeRequirements.badge === 'silver' ? 
                    '1 year of platform membership' : 
                    '1 year after earning Silver badge'}
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <TrendingUp size={16} color={Colors.textSecondary} />
                <Text style={styles.requirementText}>
                  {badgeStatus.nextBadgeRequirements.badge === 'silver' ? 
                    '5 sessions completed in first year' : 
                    '10 sessions completed per year'}
                </Text>
              </View>
              
              <View style={styles.requirementItem}>
                <DollarSign size={16} color={Colors.textSecondary} />
                <Text style={styles.requirementText}>
                  Platform fee reduced to {badgeStatus.nextBadgeRequirements.badge === 'silver' ? '9%' : '7%'}
                </Text>
              </View>
            </View>
            
            {badgeStatus.nextBadgeRequirements.sessionsNeeded > 0 && (
              <View style={styles.nextSteps}>
                <Text style={styles.nextStepsTitle}>Next Steps:</Text>
                <Text style={styles.nextStepsText}>
                  Complete {badgeStatus.nextBadgeRequirements.sessionsNeeded} more sessions
                </Text>
                <Text style={styles.timeRemaining}>
                  {badgeStatus.nextBadgeRequirements.timeRemaining}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Maintenance Info for Badge Holders */}
        {badgeStatus.maintenanceInfo && (
          <View style={styles.maintenanceCard}>
            <Text style={styles.cardTitle}>Badge Maintenance</Text>
            <Text style={styles.maintenanceText}>
              To maintain your {badgeStatus.currentBadge} badge, complete {badgeStatus.maintenanceInfo.sessionsNeeded} more sessions by {badgeStatus.maintenanceInfo.yearEnd}.
            </Text>
            {badgeStatus.maintenanceInfo.sessionsNeeded === 0 && (
              <Text style={styles.maintenanceSuccess}>
                ✅ You&apos;ve met this year&apos;s requirements!
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  safeArea: {
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  badgeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInfo: {
    marginBottom: 16,
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  badgeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  benefitsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  requirementsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  requirementsList: {
    gap: 12,
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  nextSteps: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  nextStepsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  maintenanceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  maintenanceText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  maintenanceSuccess: {
    fontSize: 14,
    color: Colors.success || Colors.primary,
    fontWeight: '500',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
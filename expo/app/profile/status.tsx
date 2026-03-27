import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { TrendingUp, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

type UserStatus = 'First User' | 'Next User' | 'Final User';

interface StatusInfo {
  currentStatus: UserStatus;
  sessionsThisMonth: number;
  progressPercentage: number;
  nextThreshold?: number;
  isMaxStatus: boolean;
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

  // Mock sessions this month - in real app this would come from backend
  const getStatusInfo = (): StatusInfo => {
    // Simulate current month sessions (0-35 for demo purposes)
    const sessionsThisMonth = Math.floor(Math.random() * 35);
    
    let currentStatus: UserStatus;
    let nextThreshold: number | undefined;
    let isMaxStatus = false;
    
    if (sessionsThisMonth >= 30) {
      currentStatus = 'Final User';
      isMaxStatus = true;
    } else if (sessionsThisMonth >= 16) {
      currentStatus = 'Next User';
      nextThreshold = 30;
    } else {
      currentStatus = 'First User';
      nextThreshold = 16;
    }
    
    // Calculate progress percentage (0-30 scale)
    const progressPercentage = Math.min((sessionsThisMonth / 30) * 100, 100);
    
    return {
      currentStatus,
      sessionsThisMonth,
      progressPercentage,
      nextThreshold,
      isMaxStatus
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Current User Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>User Status: {statusInfo.currentStatus}</Text>
          
          <Text style={styles.sessionsText}>
            {statusInfo.isMaxStatus 
              ? "You've reached the highest status: Final User." 
              : `You've completed ${statusInfo.sessionsThisMonth} sessions this month`
            }
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <TrendingUp size={20} color={Colors.black} />
            <Text style={styles.cardTitle}>Monthly Progress</Text>
          </View>
          
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {statusInfo.sessionsThisMonth}/30 sessions
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(statusInfo.progressPercentage)}%
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              {/* Progress fill */}
              <View 
                style={[styles.progressBarFill, { width: `${statusInfo.progressPercentage}%` }]} 
              />
              
              {/* First User marker at 15 sessions */}
              <View style={[styles.marker, { left: '50%' }]}>
                <View style={styles.markerLine} />
                <Text style={styles.markerText}>First</Text>
              </View>
              
              {/* Final User marker at 30 sessions */}
              <View style={[styles.marker, { right: 0 }]}>
                <View style={styles.markerLine} />
                <Text style={styles.markerText}>Final</Text>
              </View>
            </View>
          </View>
          
          {!statusInfo.isMaxStatus && statusInfo.nextThreshold && (
            <Text style={styles.progressNote}>
              Complete {statusInfo.nextThreshold - statusInfo.sessionsThisMonth} more sessions to reach {statusInfo.nextThreshold === 16 ? 'Next User' : 'Final User'} status
            </Text>
          )}
        </View>

        {/* Status Tiers Information */}
        <View style={styles.tiersCard}>
          <View style={styles.tiersHeader}>
            <Calendar size={20} color={Colors.black} />
            <Text style={styles.cardTitle}>Status Tiers (Monthly)</Text>
          </View>
          
          <View style={styles.tiersList}>
            <View style={[styles.tierItem, statusInfo.currentStatus === 'First User' && styles.activeTier]}>
              <Text style={[styles.tierName, statusInfo.currentStatus === 'First User' && styles.activeTierText]}>First User</Text>
              <Text style={[styles.tierRange, statusInfo.currentStatus === 'First User' && styles.activeTierText]}>0–15 sessions</Text>
            </View>
            
            <View style={[styles.tierItem, statusInfo.currentStatus === 'Next User' && styles.activeTier]}>
              <Text style={[styles.tierName, statusInfo.currentStatus === 'Next User' && styles.activeTierText]}>Next User</Text>
              <Text style={[styles.tierRange, statusInfo.currentStatus === 'Next User' && styles.activeTierText]}>16–30 sessions</Text>
            </View>
            
            <View style={[styles.tierItem, statusInfo.currentStatus === 'Final User' && styles.activeTier]}>
              <Text style={[styles.tierName, statusInfo.currentStatus === 'Final User' && styles.activeTierText]}>Final User</Text>
              <Text style={[styles.tierRange, statusInfo.currentStatus === 'Final User' && styles.activeTierText]}>30+ sessions</Text>
            </View>
          </View>
          
          <View style={styles.resetInfo}>
            <Text style={styles.resetText}>
              Status tiers reset every month, giving you a fresh start to reach higher levels.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
  },
  sessionsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  progressBarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.black,
    borderRadius: 6,
  },
  marker: {
    position: 'absolute',
    top: -8,
    alignItems: 'center',
  },
  markerLine: {
    width: 2,
    height: 28,
    backgroundColor: Colors.textSecondary,
    marginBottom: 4,
  },
  markerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tiersCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tiersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tiersList: {
    gap: 12,
    marginBottom: 16,
  },
  tierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTier: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  tierRange: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTierText: {
    color: Colors.white,
  },
  resetInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  resetText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
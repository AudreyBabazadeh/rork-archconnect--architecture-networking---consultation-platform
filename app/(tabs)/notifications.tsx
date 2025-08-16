import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useBooking, BookingRequest } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import CalendarModal from '@/components/CalendarModal';

interface RequestCardProps {
  request: BookingRequest;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  showActions?: boolean;
}

function RequestCard({ request, onAccept, onDecline, showActions = false }: RequestCardProps) {
  const { user } = useAuth();
  const isReceived = request.mentorId === user?.id;
  const participantName = isReceived ? request.studentName : request.mentorName;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return Colors.success;
      case 'declined':
        return Colors.error;
      default:
        return Colors.warning;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending';
    }
  };

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.participantInfo}>
          <View style={styles.avatarPlaceholder}>
            <User size={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.participantDetails}>
            <Text style={styles.participantName}>{participantName}</Text>
            <Text style={styles.requestTopic}>{request.topic}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
            {getStatusText(request.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(request.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{request.time}</Text>
        </View>
      </View>
      
      {request.description && (
        <Text style={styles.requestDescription}>{request.description}</Text>
      )}
      
      <View style={styles.requestFooter}>
        <Text style={styles.amountText}>${request.amount}</Text>
        {showActions && request.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => onDecline?.(request.id)}
            >
              <XCircle size={16} color={Colors.error} />
              <Text style={[styles.actionButtonText, { color: Colors.error }]}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => onAccept?.(request.id)}
            >
              <CheckCircle size={16} color={Colors.success} />
              <Text style={[styles.actionButtonText, { color: Colors.success }]}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'received' | 'accepted'>('received');
  const { bookingRequests, acceptBookingRequest, declineBookingRequest } = useBooking();
  const { user } = useAuth();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Filter requests received by current user (where they are the mentor and status is pending)
  const requestsReceived = bookingRequests.filter(
    (request: BookingRequest) => request.mentorId === user?.id && request.status === 'pending'
  );

  // Filter requests accepted - these are requests the CURRENT USER SENT that have been accepted by others
  const requestsAccepted = bookingRequests.filter(
    (request: BookingRequest) => 
      request.studentId === user?.id && request.status === 'accepted'
  );

  const handleAccept = async (requestId: string) => {
    try {
      await acceptBookingRequest(requestId);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineBookingRequest(requestId);
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Session Activity',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/schedule/builder')}
              style={styles.calendarButton}
            >
              <Calendar size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Requests Received
          </Text>
          {requestsReceived.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'received' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'received' && styles.activeTabBadgeText]}>
                {requestsReceived.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.activeTab]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>
            Confirmed Requests
          </Text>
          {requestsAccepted.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'accepted' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'accepted' && styles.activeTabBadgeText]}>
                {requestsAccepted.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'received' ? (
          <View style={styles.tabContent}>
            {requestsReceived.length > 0 ? (
              requestsReceived.map((request: BookingRequest) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  showActions={true}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No pending requests</Text>
                <Text style={styles.emptyStateSubtext}>New booking requests will appear here</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.tabContent}>
            {requestsAccepted.length > 0 ? (
              requestsAccepted.map((request: BookingRequest) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  showActions={false}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No confirmed requests</Text>
                <Text style={styles.emptyStateSubtext}>Requests you've sent that get accepted will appear here</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendarButton: {
    padding: 8,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: `${Colors.textSecondary}20`,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: Colors.primary,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabBadgeText: {
    color: Colors.surface,
  },
  tabContent: {
    paddingTop: 8,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  requestTopic: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: `${Colors.success}20`,
  },
  declineButton: {
    backgroundColor: `${Colors.error}20`,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
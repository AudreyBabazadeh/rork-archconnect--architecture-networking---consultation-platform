import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  MessageCircle,
  DollarSign,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { formatTimeTo12Hour } from '@/constants/timeUtils';
import { useBooking, BookingRequest } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'received' | 'accepted';

interface RequestCardProps {
  request: BookingRequest;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onMessage?: (userId: string) => void;
}

function RequestCard({ request, onAccept, onDecline, onMessage }: RequestCardProps) {
  const { user } = useAuth();
  const isReceived = request.mentorId === user?.id;
  const isPending = request.status === 'pending';
  const isAccepted = request.status === 'accepted';
  
  const handleAccept = () => {
    if (onAccept) {
      onAccept(request.id);
    }
  };
  
  const handleDecline = () => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this booking request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          style: 'destructive', 
          onPress: () => onDecline && onDecline(request.id)
        }
      ]
    );
  };
  
  const handleMessage = () => {
    const targetUserId = isReceived ? request.studentId : request.mentorId;
    if (onMessage) {
      onMessage(targetUserId);
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <User size={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {isReceived ? request.studentName : request.mentorName}
            </Text>
            <Text style={styles.userRole}>
              {isReceived ? 'Student' : 'Mentor'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          {isPending && (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Clock size={12} color={Colors.warning} />
              <Text style={[styles.statusText, { color: Colors.warning }]}>Pending</Text>
            </View>
          )}
          {isAccepted && (
            <View style={[styles.statusBadge, styles.acceptedBadge]}>
              <CheckCircle size={12} color={Colors.success} />
              <Text style={[styles.statusText, { color: Colors.success }]}>Accepted</Text>
            </View>
          )}
          <Text style={styles.amountText}>${request.amount}</Text>
        </View>
      </View>
      
      <Text style={styles.topicText}>{request.topic}</Text>
      
      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Calendar size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(request.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatTimeTo12Hour(request.time)}</Text>
        </View>
      </View>
      
      {request.description && (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {request.description}
        </Text>
      )}
      
      <View style={styles.actionButtons}>
        {isPending && isReceived && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]} 
              onPress={handleAccept}
            >
              <CheckCircle size={16} color={Colors.white} />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]} 
              onPress={handleDecline}
            >
              <XCircle size={16} color={Colors.error} />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}
        
        {(isAccepted || (!isPending && !isReceived)) && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.messageButton]} 
            onPress={handleMessage}
          >
            <MessageCircle size={16} color={Colors.primary} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        )}
        
        {isAccepted && !isReceived && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.payButton]} 
            onPress={() => router.push(`/booking/${request.id}`)}
          >
            <DollarSign size={16} color={Colors.white} />
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const { bookingRequests, acceptBookingRequest, declineBookingRequest } = useBooking();
  const { user } = useAuth();
  
  const receivedRequests = useMemo(() => {
    if (!user) return [];
    return bookingRequests.filter(request => 
      request.mentorId === user.id && request.status === 'pending'
    );
  }, [bookingRequests, user]);
  
  const acceptedRequests = useMemo(() => {
    if (!user) return [];
    return bookingRequests.filter(request => 
      (request.mentorId === user.id || request.studentId === user.id) && 
      request.status === 'accepted'
    );
  }, [bookingRequests, user]);
  
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptBookingRequest(requestId);
      Alert.alert('Success', 'Booking request accepted! The student will be notified.');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept booking request. Please try again.');
    }
  };
  
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineBookingRequest(requestId);
      Alert.alert('Request Declined', 'The student has been notified.');
    } catch (error) {
      Alert.alert('Error', 'Failed to decline booking request. Please try again.');
    }
  };
  
  const handleMessage = (userId: string) => {
    router.push(`/messages/${userId}`);
  };
  
  const handleScheduleBuilder = () => {
    router.push('/schedule/builder');
  };
  
  const renderRequests = () => {
    const requests = activeTab === 'received' ? receivedRequests : acceptedRequests;
    
    if (requests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Calendar size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>
            {activeTab === 'received' ? 'No pending requests' : 'No accepted requests'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'received' 
              ? 'New booking requests will appear here' 
              : 'Accepted booking requests will appear here'
            }
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
        {requests.map(request => (
          <RequestCard
            key={request.id}
            request={request}
            onAccept={activeTab === 'received' ? handleAcceptRequest : undefined}
            onDecline={activeTab === 'received' ? handleDeclineRequest : undefined}
            onMessage={handleMessage}
          />
        ))}
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Notifications',
        }} 
      />
      
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Booking Requests</Text>
        <TouchableOpacity onPress={handleScheduleBuilder} style={styles.calendarButton}>
          <Calendar size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Requests Received
          </Text>
          {receivedRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{receivedRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.activeTab]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>
            Requests Accepted
          </Text>
          {acceptedRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{acceptedRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {renderRequests()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
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
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  requestsList: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  pendingBadge: {
    backgroundColor: `${Colors.warning}20`,
  },
  acceptedBadge: {
    backgroundColor: `${Colors.success}20`,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  topicText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sessionDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  declineButton: {
    backgroundColor: `${Colors.error}20`,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  messageButton: {
    backgroundColor: `${Colors.primary}20`,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  payButton: {
    backgroundColor: Colors.primary,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
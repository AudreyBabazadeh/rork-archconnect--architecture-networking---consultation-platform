import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Clock,
  User,
  MapPin,
  MessageCircle,
  RotateCcw,
  X,
  Video,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useBooking, BookingRequest } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';

type ViewMode = 'month' | 'week' | 'day';
type FilterType = 'all' | 'booked-by-me' | 'booked-with-me';

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  duration: number;
  participantName: string;
  participantAvatar?: string;
  location?: string;
  meetingLink?: string;
  type: 'booked-by-me' | 'booked-with-me';
  amount: number;
  description?: string;
  timezone?: string;
}

interface EventDetailsModalProps {
  visible: boolean;
  event: ScheduleEvent | null;
  onClose: () => void;
}

function EventDetailsModal({ visible, event, onClose }: EventDetailsModalProps) {
  if (!event) return null;

  const handleJoin = () => {
    if (event.meetingLink) {
      Alert.alert('Join Meeting', `Would you like to join the meeting?\n\n${event.meetingLink}`);
    } else {
      Alert.alert('Meeting Info', 'Meeting link will be provided closer to the session time.');
    }
  };

  const handleMessage = () => {
    router.push('/messages');
    onClose();
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Reschedule functionality will be available soon.');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this session?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => {
          Alert.alert('Session Cancelled', 'The session has been cancelled and both parties have been notified.');
          onClose();
        }}
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Session Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.participantInfo}>
                <View style={styles.avatarPlaceholder}>
                  <User size={20} color={Colors.textSecondary} />
                </View>
                <View>
                  <Text style={styles.participantName}>{event.participantName}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: event.type === 'booked-by-me' ? `${Colors.primary}20` : `${Colors.success}20` }]}>
                    <Text style={[styles.typeBadgeText, { color: event.type === 'booked-by-me' ? Colors.primary : Colors.success }]}>
                      {event.type === 'booked-by-me' ? 'Booked by Me' : 'Booked with Me'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.amountText}>${event.amount}</Text>
            </View>
            
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.eventDetailsModal}>
              <View style={styles.detailRow}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{event.time} ({event.duration} min)</Text>
              </View>
              {event.timezone && (
                <View style={styles.timezoneChip}>
                  <Text style={styles.timezoneText}>{event.timezone}</Text>
                </View>
              )}
              {event.location && (
                <View style={styles.detailRow}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
              )}
              {event.meetingLink && (
                <View style={styles.detailRow}>
                  <Video size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>Video call link available</Text>
                </View>
              )}
            </View>
            
            {event.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionTitle}>Notes</Text>
                <Text style={styles.descriptionText}>{event.description}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.joinButton]} onPress={handleJoin}>
              <Video size={20} color={Colors.white} />
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={handleMessage}>
              <MessageCircle size={20} color={Colors.primary} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleReschedule}>
              <RotateCcw size={18} color={Colors.textSecondary} />
              <Text style={styles.secondaryButtonText}>Reschedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
              <X size={18} color={Colors.error} />
              <Text style={[styles.secondaryButtonText, { color: Colors.error }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function ScheduleBuilderScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);
  
  const { bookingRequests } = useBooking();
  const { user } = useAuth();

  // Convert booking requests to schedule events
  const scheduleEvents = useMemo<ScheduleEvent[]>(() => {
    if (!user) return [];
    
    return bookingRequests
      .filter((request: BookingRequest) => request.status === 'accepted')
      .map((request: BookingRequest): ScheduleEvent => {
        const isBookedByMe = request.studentId === user.id;
        return {
          id: request.id,
          title: request.topic,
          time: request.time,
          date: request.date,
          duration: 60, // Default duration
          participantName: isBookedByMe ? request.mentorName : request.studentName,
          type: isBookedByMe ? 'booked-by-me' : 'booked-with-me',
          amount: request.amount,
          description: request.description,
          meetingLink: 'https://meet.example.com/session-' + request.id,
          location: 'Video Call',
        };
      });
  }, [bookingRequests, user]);

  // Filter events based on selected filter
  const filteredEvents = useMemo<ScheduleEvent[]>(() => {
    if (filter === 'all') return scheduleEvents;
    return scheduleEvents.filter(event => event.type === filter);
  }, [scheduleEvents, filter]);

  // Get events for selected date (for day view)
  const dayEvents = useMemo<ScheduleEvent[]>(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date.startsWith(dateStr));
  }, [filteredEvents, selectedDate]);



  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (viewMode === 'month') {
      setViewMode('day');
    }
  };

  const handleEventPress = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const renderCalendarDay = (dayIndex: number, currentDate: Date, month: number) => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayEvents = filteredEvents.filter(event => event.date.startsWith(dateStr));
    const isCurrentMonth = currentDate.getMonth() === month;
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    return (
      <TouchableOpacity
        key={dayIndex}
        style={[
          styles.calendarDay,
          !isCurrentMonth && styles.calendarDayInactive,
          isToday && styles.calendarDayToday,
        ]}
        onPress={() => handleDateSelect(new Date(currentDate))}
      >
        <Text style={[
          styles.calendarDayText,
          !isCurrentMonth && styles.calendarDayTextInactive,
          isToday && styles.calendarDayTextToday,
        ]}>
          {currentDate.getDate()}
        </Text>
        {dayEvents.length > 0 && (
          <View style={styles.eventIndicator}>
            <Text style={styles.eventCount}>{dayEvents.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      calendarDays.push(renderCalendarDay(i, new Date(currentDate), month));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return (
      <View style={styles.monthView}>
        <View style={styles.weekDaysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {calendarDays}
        </View>
      </View>
    );
  };

  const renderDayView = () => {
    const sortedEvents = [...dayEvents].sort((a, b) => a.time.localeCompare(b.time));
    
    return (
      <ScrollView style={styles.dayView}>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Booked by Me</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendText}>Booked with Me</Text>
          </View>
        </View>
        
        {sortedEvents.length > 0 ? (
          sortedEvents.map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
            >
              <View style={styles.eventTime}>
                <Text style={styles.eventTimeText}>{event.time}</Text>
                <Text style={styles.eventDuration}>{event.duration}m</Text>
              </View>
              
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: event.type === 'booked-by-me' ? `${Colors.primary}20` : `${Colors.success}20` }]}>
                    <Text style={[styles.typeBadgeText, { color: event.type === 'booked-by-me' ? Colors.primary : Colors.success }]}>
                      {event.type === 'booked-by-me' ? 'Booked by Me' : 'Booked with Me'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.participantInfo}>
                  <View style={styles.avatarPlaceholder}>
                    <User size={16} color={Colors.textSecondary} />
                  </View>
                  <Text style={styles.participantName}>{event.participantName}</Text>
                </View>
                
                <View style={styles.eventLocation}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventLocationText}>{event.location}</Text>
                </View>
              </View>
              
              <View style={styles.eventAmount}>
                <Text style={styles.amountText}>${event.amount}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyDay}>
            <Calendar size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyDayText}>No sessions scheduled</Text>
            <Text style={styles.emptyDaySubtext}>Your confirmed sessions will appear here</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Schedule',
          headerBackTitle: 'Back',
        }} 
      />
      
      {/* Header Controls */}
      <View style={styles.header}>
        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.currentMonth}>
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              ...(viewMode === 'day' && { day: 'numeric' })
            })}
          </Text>
          
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
            <ChevronRight size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* View Mode Toggle */}
        <View style={styles.viewModeToggle}>
          {(['month', 'day'] as ViewMode[]).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Filter */}
      <View style={styles.filterContainer}>
        <Filter size={16} color={Colors.textSecondary} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { key: 'all', label: 'All Sessions' },
            { key: 'booked-by-me', label: 'Booked by Me' },
            { key: 'booked-with-me', label: 'Booked with Me' },
          ].map(filterOption => (
            <TouchableOpacity
              key={filterOption.key}
              style={[styles.filterButton, filter === filterOption.key && styles.filterButtonActive]}
              onPress={() => setFilter(filterOption.key as FilterType)}
            >
              <Text style={[styles.filterText, filter === filterOption.key && styles.filterTextActive]}>
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'month' ? renderMonthView() : renderDayView()}
      </View>
      
      {/* Event Details Modal */}
      <EventDetailsModal
        visible={showEventDetails}
        event={selectedEvent}
        onClose={() => setShowEventDetails(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  currentMonth: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: Colors.surface,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  viewModeTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    marginLeft: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  // Month View Styles
  monthView: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  calendarDayInactive: {
    backgroundColor: Colors.background,
  },
  calendarDayToday: {
    backgroundColor: `${Colors.primary}10`,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  calendarDayTextInactive: {
    color: Colors.textSecondary,
  },
  calendarDayTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCount: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  // Day View Styles
  dayView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  eventTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  eventDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  participantName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  eventAmount: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyDayText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDaySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  timezoneChip: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 4,
  },
  timezoneText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
  },
  descriptionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  joinButton: {
    backgroundColor: Colors.primary,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  messageButton: {
    backgroundColor: `${Colors.primary}20`,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  eventDetailsModal: {
    marginTop: 16,
  },
});
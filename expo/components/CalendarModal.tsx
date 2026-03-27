import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { formatTimeTo12Hour } from '@/constants/timeUtils';
import { useBooking, BookingRequest } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'session' | 'meeting';
  participant: string;
}

export default function CalendarModal({ visible, onClose }: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { bookingRequests } = useBooking();
  const { user } = useAuth();

  // Get accepted bookings for the current user
  const acceptedBookings = bookingRequests.filter(
    (request: BookingRequest) => 
      request.status === 'accepted' && 
      (request.mentorId === user?.id || request.studentId === user?.id)
  );

  // Create marked dates object for calendar
  const markedDates = acceptedBookings.reduce((acc, booking) => {
    const dateKey = booking.date;
    acc[dateKey] = {
      marked: true,
      dotColor: Colors.primary,
      selectedColor: Colors.primary,
    };
    return acc;
  }, {} as any);

  // Add selected date styling
  if (selectedDate && markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: Colors.primary,
    };
  } else if (selectedDate) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: Colors.primary,
    };
  }

  // Get events for selected date
  const getEventsForDate = (date: string): CalendarEvent[] => {
    return acceptedBookings
      .filter(booking => booking.date === date)
      .map(booking => ({
        id: booking.id,
        title: booking.topic,
        time: booking.time,
        type: 'session' as const,
        participant: booking.mentorId === user?.id ? booking.studentName : booking.mentorName,
      }));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: Colors.surface,
              calendarBackground: Colors.surface,
              textSectionTitleColor: Colors.textSecondary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.surface,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.textSecondary,
              dotColor: Colors.primary,
              selectedDotColor: Colors.surface,
              arrowColor: Colors.primary,
              monthTextColor: Colors.text,
              indicatorColor: Colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
            }}
            markedDates={markedDates}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            markingType={'dot'}
          />

          {selectedDate && (
            <View style={styles.eventsSection}>
              <Text style={styles.eventsTitle}>
                Events for {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventTime}>
                      <Text style={styles.eventTimeText}>{formatTimeTo12Hour(event.time)}</Text>
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventParticipant}>with {event.participant}</Text>
                    </View>
                    <View style={styles.eventType}>
                      <View style={[styles.eventTypeBadge, { backgroundColor: Colors.primary + '20' }]}>
                        <Text style={[styles.eventTypeText, { color: Colors.primary }]}>Session</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noEventsContainer}>
                  <Text style={styles.noEventsText}>No events scheduled for this day</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  calendar: {
    marginBottom: 20,
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventTime: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  eventDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  eventParticipant: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  eventType: {
    justifyContent: 'center',
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEventsText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
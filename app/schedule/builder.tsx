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
  Dimensions,
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
  Plus,
  CalendarPlus,
  CheckSquare,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { formatTimeTo12Hour, generateTimeSlots12Hour } from '@/constants/timeUtils';
import { useBooking, BookingRequest } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule, Event as ScheduleItemEvent, Task, UnavailablePeriod } from '@/contexts/ScheduleContext';

type ViewMode = 'month' | 'week' | 'day';
type FilterType = 'all' | 'booked-by-me' | 'booked-with-me' | 'event' | 'task';

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  duration: number;
  participantName: string;
  participantId?: string;
  participantAvatar?: string;
  location?: string;
  meetingLink?: string;
  type: 'booked-by-me' | 'booked-with-me' | 'event' | 'task';
  amount: number;
  description?: string;
  timezone?: string;
}

interface EventDetailsModalProps {
  visible: boolean;
  event: ScheduleEvent | null;
  onClose: () => void;
  onDelete?: () => void;
}

function EventDetailsModal({ visible, event, onClose, onDelete }: EventDetailsModalProps) {
  if (!event) return null;

  const handleJoin = () => {
    if (event.meetingLink) {
      Alert.alert('Join Meeting', `Would you like to join the meeting?\n\n${event.meetingLink}`);
    } else {
      Alert.alert('Meeting Info', 'Meeting link will be provided closer to the session time.');
    }
  };

  const handleMessage = () => {
    if (event.participantId) {
      router.push(`/messages/${event.participantId}`);
    } else {
      router.push('/messages');
    }
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
          if (onDelete) {
            onDelete();
          }
          Alert.alert('Session Cancelled', 'The session has been cancelled and removed from your calendar.');
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
            
            <View style={styles.eventDetails}>
              <View style={styles.detailRow}>
                <Calendar size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </View>
              <View style={styles.detailRow}>
                <Clock size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{formatTimeTo12Hour(event.time)} ({event.duration} min)</Text>
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
  const [showFABMenu, setShowFABMenu] = useState<boolean>(false);
  
  const { bookingRequests } = useBooking();
  const { user } = useAuth();
  const { scheduleItems, deleteScheduleItem } = useSchedule();

  const scheduleEvents = useMemo<ScheduleEvent[]>(() => {
    if (!user) return [];
    
    const bookingEvents = bookingRequests
      .filter((request: BookingRequest) => request.status === 'accepted')
      .map((request: BookingRequest): ScheduleEvent => {
        const isBookedByMe = request.studentId === user.id;
        return {
          id: request.id,
          title: request.topic,
          time: request.time,
          date: request.date,
          duration: 60,
          participantName: isBookedByMe ? request.mentorName : request.studentName,
          participantId: isBookedByMe ? request.mentorId : request.studentId,
          type: isBookedByMe ? 'booked-by-me' : 'booked-with-me',
          amount: request.amount,
          description: request.description,
          meetingLink: 'https://meet.example.com/session-' + request.id,
          location: 'Video Call',
        };
      });

    const customEvents = scheduleItems
      .filter((item): item is ScheduleItemEvent => item.type === 'event')
      .map((event): ScheduleEvent => ({
        id: event.id,
        title: event.title,
        time: event.time,
        date: event.date,
        duration: event.duration,
        participantName: 'Personal Event',
        type: 'event' as any,
        amount: 0,
        description: event.description,
        location: event.location,
      }));

    const tasks = scheduleItems
      .filter((item): item is Task => item.type === 'task')
      .map((task): ScheduleEvent => ({
        id: task.id,
        title: `📋 ${task.title}`,
        time: '09:00',
        date: task.date,
        duration: 30,
        participantName: 'Task',
        type: 'task' as any,
        amount: 0,
        description: task.description,
        location: `Priority: ${task.priority}`,
      }));

    const unavailable = scheduleItems
      .filter((item): item is UnavailablePeriod => item.type === 'unavailable')
      .flatMap((period): ScheduleEvent[] => {
        const events: ScheduleEvent[] = [];
        const start = new Date(period.startDate);
        const end = period.endDate ? new Date(period.endDate) : start;
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          events.push({
            id: `${period.id}-${d.toISOString().split('T')[0]}`,
            title: `🚫 ${period.reason || 'Unavailable'}`,
            time: period.startTime || '00:00',
            date: d.toISOString().split('T')[0],
            duration: period.endTime && period.startTime 
              ? (parseInt(period.endTime.split(':')[0]) * 60 + parseInt(period.endTime.split(':')[1])) - 
                (parseInt(period.startTime.split(':')[0]) * 60 + parseInt(period.startTime.split(':')[1]))
              : 1440,
            participantName: 'Unavailability',
            type: 'booked-by-me',
            amount: 0,
            description: period.reason,
          });
        }
        
        return events;
      });

    return [...bookingEvents, ...customEvents, ...tasks, ...unavailable];
  }, [bookingRequests, user, scheduleItems]);

  const filteredEvents = useMemo<ScheduleEvent[]>(() => {
    if (filter === 'all') return scheduleEvents;
    return scheduleEvents.filter(event => event.type === filter);
  }, [scheduleEvents, filter]);

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

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteScheduleItem(selectedEvent.id.split('-')[0]);
      setShowEventDetails(false);
      setSelectedEvent(null);
    }
  };

  const handleAddEvent = () => {
    setShowFABMenu(false);
    router.push('/schedule/add-event');
  };

  const handleAddTask = () => {
    setShowFABMenu(false);
    router.push('/schedule/add-task');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
    } else if (viewMode === 'week') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
    } else {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
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
      calendarDays.push({
        index: i,
        date: new Date(currentDate),
        month: month
      });
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
          {calendarDays.map(({ index, date, month }) => renderCalendarDay(index, date, month))}
        </View>
      </View>
    );
  };

  const generateTimeSlots = () => {
    return generateTimeSlots12Hour(6, 24);
  };

  const getEventPosition = (eventTime: string, duration: number) => {
    const [hours, minutes] = eventTime.split(':').map(Number);
    const startMinutes = (hours - 6) * 60 + minutes;
    const slotHeight = 30;
    const top = (startMinutes / 30) * slotHeight;
    const height = (duration / 30) * slotHeight;
    return { top, height };
  };

  const getOverlappingEvents = (events: ScheduleEvent[], currentEvent: ScheduleEvent) => {
    const currentStart = new Date(`${currentEvent.date}T${currentEvent.time}:00`);
    const currentEnd = new Date(currentStart.getTime() + currentEvent.duration * 60000);

    return events.filter(event => {
      if (event.id === currentEvent.id) return true;
      const eventStart = new Date(`${event.date}T${event.time}:00`);
      const eventEnd = new Date(eventStart.getTime() + event.duration * 60000);

      return (
        (currentStart >= eventStart && currentStart < eventEnd) ||
        (currentEnd > eventStart && currentEnd <= eventEnd) ||
        (currentStart <= eventStart && currentEnd >= eventEnd)
      );
    });
  };

  const getEventLayout = (event: ScheduleEvent, dayEvents: ScheduleEvent[]) => {
    const overlapping = getOverlappingEvents(dayEvents, event);
    const totalOverlapping = overlapping.length;
    
    if (totalOverlapping === 1) {
      return { widthPercent: 100, leftPercent: 0 };
    }

    const sortedOverlapping = overlapping.sort((a, b) => {
      const aTimestamp = parseInt(a.id.split('-')[0] || '0');
      const bTimestamp = parseInt(b.id.split('-')[0] || '0');
      return aTimestamp - bTimestamp;
    });
    const eventIndex = sortedOverlapping.findIndex(e => e.id === event.id);
    const widthPercent = 100 / totalOverlapping;
    const leftPercent = widthPercent * eventIndex;

    return { widthPercent, leftPercent };
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const dayOffset = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOffset);
    
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }
    
    return (
      <View style={styles.weekView}>
        <View style={styles.weekHeader}>
          <View style={styles.timeColumnHeader} />
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = filteredEvents.filter(event => 
              event.date.startsWith(day.toISOString().split('T')[0])
            );
            
            return (
              <View
                key={index}
                style={[styles.weekDayHeader, isToday && styles.weekDayHeaderToday]}
              >
                <Text style={[styles.weekDayName, isToday && styles.weekDayNameToday]}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.weekDayNumber, isToday && styles.weekDayNumberToday]}>
                  {day.getDate()}
                </Text>
                {dayEvents.length > 0 && (
                  <View style={styles.weekEventIndicator}>
                    <Text style={styles.weekEventCount}>{dayEvents.length}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        <ScrollView style={styles.weekContent} showsVerticalScrollIndicator={false}>
          <View style={styles.weekGrid}>
            {generateTimeSlots().map((time, timeIndex) => (
              <View key={timeIndex} style={styles.weekTimeRow}>
                <View style={styles.weekTimeLabel}>
                  {time.includes('00 ') ? (
                    <Text style={styles.weekTimeText}>{time}</Text>
                  ) : null}
                </View>
                {weekDays.map((day, dayIndex) => (
                  <View key={dayIndex} style={styles.weekTimeSlot} />
                ))}
              </View>
            ))}
            
            {filteredEvents.map((event) => {
              const eventDateStr = event.date.includes('T') ? event.date.split('T')[0] : event.date;
              const dayIndex = weekDays.findIndex(day => day.toISOString().split('T')[0] === eventDateStr);
              
              if (dayIndex === -1) return null;
              
              const dayDateStr = weekDays[dayIndex].toISOString().split('T')[0];
              const dayEventsForDay = filteredEvents.filter(e => {
                const eDateStr = e.date.includes('T') ? e.date.split('T')[0] : e.date;
                return eDateStr === dayDateStr;
              });
              
              const { top, height } = getEventPosition(event.time, event.duration);
              const { widthPercent, leftPercent } = getEventLayout(event, dayEventsForDay);
              const isHalfHour = event.duration === 30;
              const isTask = event.title.startsWith('📋');
              
              const screenWidth = Dimensions.get('window').width;
              const timeColumnWidth = 60;
              const availableWidth = screenWidth - timeColumnWidth;
              const columnWidth = availableWidth / 7;
              const columnLeft = timeColumnWidth + (dayIndex * columnWidth);
              const eventWidth = (columnWidth * widthPercent) / 100;
              const eventLeftPos = columnLeft + (columnWidth * leftPercent) / 100;
              
              const getEventColor = () => {
                if (event.type === 'event' || event.type === 'task') return '#FFFFFF';
                if (event.type === 'booked-by-me') return '#000000';
                if (event.type === 'booked-with-me') return '#00C853';
                return Colors.primary;
              };

              const getEventTextColor = () => {
                if (event.type === 'event' || event.type === 'task') return Colors.text;
                return Colors.white;
              };

              return (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.weekEventBar,
                    {
                      left: eventLeftPos,
                      width: eventWidth,
                      top: top,
                      height: height,
                      backgroundColor: getEventColor(),
                      borderWidth: (event.type === 'event' || event.type === 'task') ? 1 : 0,
                      borderColor: Colors.border,
                    }
                  ]}
                  onPress={() => handleEventPress(event)}
                >
                  <Text style={[styles.weekEventTitle, isHalfHour && { fontSize: 10 }, { color: getEventTextColor() }]} numberOfLines={isHalfHour ? 2 : 1}>
                    {event.title}
                  </Text>
                  {!isHalfHour && widthPercent > 50 && (
                    <Text style={[styles.weekEventTime, { color: getEventTextColor() }]} numberOfLines={1}>
                      {formatTimeTo12Hour(event.time)} • {isTask ? event.participantName : event.participantName}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderDayView = () => {
    const timeSlots = generateTimeSlots();
    const sortedEvents = [...dayEvents].sort((a, b) => a.time.localeCompare(b.time));
    
    return (
      <View style={styles.dayView}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border }]} />
            <Text style={styles.legendText}>Events & Tasks</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#000000' }]} />
            <Text style={styles.legendText}>Booked by Me</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#00C853' }]} />
            <Text style={styles.legendText}>Booked with Me</Text>
          </View>
        </View>
        
        <ScrollView style={styles.dayContent} showsVerticalScrollIndicator={false}>
          <View style={styles.dayGrid}>
            {timeSlots.map((time, index) => (
              <View key={index} style={styles.dayTimeRow}>
                <View style={styles.dayTimeLabel}>
                  {time.includes('00 ') ? (
                    <Text style={styles.dayTimeText}>{time}</Text>
                  ) : null}
                </View>
                <View style={styles.dayTimeSlot} />
              </View>
            ))}
            
            {sortedEvents.map(event => {
              const { top, height } = getEventPosition(event.time, event.duration);
              const { widthPercent, leftPercent } = getEventLayout(event, sortedEvents);
              const isHalfHour = event.duration === 30;
              const isTask = event.title.startsWith('📋');
              const hasMultipleOverlaps = widthPercent < 100;
              
              const getEventColor = () => {
                if (event.type === 'event' || event.type === 'task') return '#FFFFFF';
                if (event.type === 'booked-by-me') return '#000000';
                if (event.type === 'booked-with-me') return '#00C853';
                return Colors.primary;
              };

              const getEventTextColor = () => {
                if (event.type === 'event' || event.type === 'task') return Colors.text;
                return Colors.white;
              };

              return (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.dayEventBar,
                    {
                      top: top,
                      height: height,
                      left: hasMultipleOverlaps ? `${62 + leftPercent * 0.85}%` : 62,
                      right: hasMultipleOverlaps ? `${8 + (100 - leftPercent - widthPercent) * 0.85}%` : 8,
                      backgroundColor: getEventColor(),
                      borderWidth: (event.type === 'event' || event.type === 'task') ? 1 : 0,
                      borderColor: Colors.border,
                    }
                  ]}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.dayEventContent}>
                    <Text style={[styles.dayEventTitle, (isHalfHour || hasMultipleOverlaps) && { fontSize: 12, marginBottom: 0 }, { color: getEventTextColor() }]} numberOfLines={isHalfHour || hasMultipleOverlaps ? 2 : 1}>
                      {event.title}
                    </Text>
                    {!isHalfHour && !hasMultipleOverlaps && (
                      <>
                        <View style={styles.dayEventDetails}>
                          <View style={styles.dayEventParticipant}>
                            <View style={[styles.dayEventAvatar, { backgroundColor: event.type === 'event' || event.type === 'task' ? Colors.border : 'rgba(255,255,255,0.3)' }]}>
                              <User size={12} color={event.type === 'event' || event.type === 'task' ? Colors.textSecondary : Colors.white} />
                            </View>
                            <Text style={[styles.dayEventParticipantName, { color: getEventTextColor() }]} numberOfLines={1}>
                              {event.participantName}
                            </Text>
                          </View>
                          {!isTask && (
                            <View style={[styles.dayEventBadge, { backgroundColor: event.type === 'event' || event.type === 'task' ? Colors.border : 'rgba(255,255,255,0.2)' }]}>
                              <Text style={[styles.dayEventBadgeText, { color: getEventTextColor() }]}>
                                {event.type === 'booked-by-me' ? 'Booked by Me' : event.type === 'booked-with-me' ? 'Booked with Me' : 'Event'}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.dayEventMeta}>
                          <Text style={[styles.dayEventTime, { color: getEventTextColor(), opacity: event.type === 'event' || event.type === 'task' ? 1 : 0.9 }]}>
                            {formatTimeTo12Hour(event.time)} • {event.duration}min
                          </Text>
                          <Text style={[styles.dayEventLocation, { color: getEventTextColor(), opacity: event.type === 'event' || event.type === 'task' ? 1 : 0.9 }]}>
                            {event.location}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {sortedEvents.length === 0 && (
            <View style={styles.emptyDay}>
              <Calendar size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyDayText}>No sessions scheduled</Text>
              <Text style={styles.emptyDaySubtext}>Your confirmed sessions will appear here</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
        
        <View style={styles.viewModeToggle}>
          {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
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
      
      <View style={styles.content}>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </View>
      
      <EventDetailsModal
        visible={showEventDetails}
        event={selectedEvent}
        onClose={() => setShowEventDetails(false)}
        onDelete={handleDeleteEvent}
      />
      
      {showFABMenu && (
        <TouchableOpacity 
          style={styles.fabOverlay} 
          activeOpacity={1}
          onPress={() => setShowFABMenu(false)}
        >
          <View style={styles.fabMenu}>
            <TouchableOpacity 
              style={styles.fabMenuItem}
              onPress={handleAddEvent}
              activeOpacity={0.7}
            >
              <View style={styles.fabMenuIconContainer}>
                <CalendarPlus size={20} color={Colors.white} />
              </View>
              <Text style={styles.fabMenuText}>Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fabMenuItem}
              onPress={handleAddTask}
              activeOpacity={0.7}
            >
              <View style={styles.fabMenuIconContainer}>
                <CheckSquare size={20} color={Colors.white} />
              </View>
              <Text style={styles.fabMenuText}>Task</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowFABMenu(!showFABMenu)}
        activeOpacity={0.8}
      >
        <Plus 
          size={28} 
          color={Colors.white} 
          style={[styles.fabIcon, showFABMenu && styles.fabIconRotated]} 
        />
      </TouchableOpacity>
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
  weekView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeColumnHeader: {
    width: 60,
    height: 60,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  weekDayHeaderToday: {
    backgroundColor: `${Colors.primary}10`,
  },
  weekDayName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  weekDayNameToday: {
    color: Colors.primary,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  weekDayNumberToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  weekEventIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    minWidth: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekEventCount: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.white,
  },
  weekContent: {
    flex: 1,
  },
  weekGrid: {
    position: 'relative',
    minHeight: 1080,
  },
  weekTimeRow: {
    flexDirection: 'row',
    height: 30,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  weekTimeLabel: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  weekTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  weekTimeSlot: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: Colors.border,
  },
  weekEventBar: {
    position: 'absolute',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginHorizontal: 1,
  },
  weekEventTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
    flexWrap: 'wrap',
  },
  weekEventTime: {
    fontSize: 9,
    color: Colors.white,
    opacity: 0.9,
  },
  dayView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dayContent: {
    flex: 1,
  },
  dayGrid: {
    position: 'relative',
    minHeight: 1080,
  },
  dayTimeRow: {
    flexDirection: 'row',
    height: 30,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  dayTimeLabel: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  dayTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dayTimeSlot: {
    flex: 1,
  },
  dayEventBar: {
    position: 'absolute',
    left: 62,
    right: 8,
    borderRadius: 8,
    padding: 8,
    marginVertical: 1,
  },
  dayEventContent: {
    flex: 1,
  },
  dayEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  dayEventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayEventParticipant: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayEventAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  dayEventParticipantName: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500',
    flex: 1,
  },
  dayEventBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dayEventBadgeText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '600',
  },
  dayEventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayEventTime: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.9,
  },
  dayEventLocation: {
    fontSize: 11,
    color: Colors.white,
    opacity: 0.9,
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
  eventDetails: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    transform: [{ rotate: '0deg' }],
  },
  fabIconRotated: {
    transform: [{ rotate: '45deg' }],
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingBottom: 100,
  },
  fabMenu: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 180,
  },
  fabMenuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fabMenuText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
});
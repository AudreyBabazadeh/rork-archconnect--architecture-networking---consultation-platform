import { Clock, Calendar, ChevronDown, Plus, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { TopicManager } from '@/components/TopicManager';
import { Topic } from '@/types/user';

interface TimeInterval {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  id: string;
  day: string;
  isEnabled: boolean;
  intervals: TimeInterval[];
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const generateTimeSlots = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeSlots();

export default function ManageAvailabilityScreen() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>((user as any)?.topics || []);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map(day => ({
      id: day.toLowerCase(),
      day,
      isEnabled: day !== 'Saturday' && day !== 'Sunday',
      intervals: [{
        id: `${day.toLowerCase()}-1`,
        startTime: '09:00',
        endTime: '17:00'
      }]
    }))
  );
  const [isAvailableForBooking, setIsAvailableForBooking] = useState(true);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(7);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleDaySchedule = (dayId: string) => {
    setDaySchedules(prev => 
      prev.map(schedule => 
        schedule.id === dayId 
          ? { ...schedule, isEnabled: !schedule.isEnabled }
          : schedule
      )
    );
  };

  const addTimeInterval = (dayId: string) => {
    setDaySchedules(prev => 
      prev.map(schedule => {
        if (schedule.id === dayId) {
          const newInterval: TimeInterval = {
            id: `${dayId}-${Date.now()}`,
            startTime: '09:00',
            endTime: '17:00'
          };
          return {
            ...schedule,
            intervals: [...schedule.intervals, newInterval]
          };
        }
        return schedule;
      })
    );
  };

  const removeTimeInterval = (dayId: string, intervalId: string) => {
    setDaySchedules(prev => 
      prev.map(schedule => {
        if (schedule.id === dayId && schedule.intervals.length > 1) {
          return {
            ...schedule,
            intervals: schedule.intervals.filter(interval => interval.id !== intervalId)
          };
        }
        return schedule;
      })
    );
  };

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ dayId: string; intervalId: string; type: 'start' | 'end' } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving availability settings:', {
        topics,
        daySchedules,
        isAvailableForBooking,
        advanceBookingDays
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Availability settings saved successfully!');
    } catch (error) {
      console.error('Failed to save availability settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openTimePicker = (dayId: string, intervalId: string, type: 'start' | 'end') => {
    setSelectedTimeSlot({ dayId, intervalId, type });
    setTimePickerVisible(true);
  };

  const selectTime = (time: string) => {
    if (!selectedTimeSlot) return;
    
    setDaySchedules(prev => 
      prev.map(schedule => {
        if (schedule.id === selectedTimeSlot.dayId) {
          return {
            ...schedule,
            intervals: schedule.intervals.map(interval => {
              if (interval.id === selectedTimeSlot.intervalId) {
                if (selectedTimeSlot.type === 'start') {
                  return { ...interval, startTime: time };
                } else {
                  return { ...interval, endTime: time };
                }
              }
              return interval;
            })
          };
        }
        return schedule;
      })
    );
    
    setTimePickerVisible(false);
    setSelectedTimeSlot(null);
  };

  const renderTimePickerItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.timePickerItem}
      onPress={() => selectTime(item)}
    >
      <Text style={styles.timePickerText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderDaySchedule = (schedule: DaySchedule) => (
    <View key={schedule.id} style={styles.timeSlotItem}>
      <View style={styles.timeSlotHeader}>
        <Text style={styles.dayLabel}>{schedule.day}</Text>
        <Switch
          value={schedule.isEnabled}
          onValueChange={() => toggleDaySchedule(schedule.id)}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>
      
      {schedule.isEnabled && (
        <View style={styles.intervalsContainer}>
          {schedule.intervals.map((interval, index) => (
            <View key={interval.id} style={styles.intervalRow}>
              <View style={styles.timeInputs}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeLabel}>From</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => openTimePicker(schedule.id, interval.id, 'start')}
                  >
                    <Clock size={16} color={Colors.textLight} />
                    <Text style={styles.timeText}>{interval.startTime}</Text>
                    <ChevronDown size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeLabel}>To</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => openTimePicker(schedule.id, interval.id, 'end')}
                  >
                    <Clock size={16} color={Colors.textLight} />
                    <Text style={styles.timeText}>{interval.endTime}</Text>
                    <ChevronDown size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>
                
                {schedule.intervals.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeIntervalButton}
                    onPress={() => removeTimeInterval(schedule.id, interval.id)}
                  >
                    <Text style={styles.removeIntervalText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {index === schedule.intervals.length - 1 && (
                <TouchableOpacity 
                  style={styles.addIntervalButton}
                  onPress={() => addTimeInterval(schedule.id)}
                >
                  <Plus size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to manage availability</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Manage Availability',
          headerRight: () => (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Check size={20} color={isSaving ? Colors.textLight : Colors.primary} />
              <Text style={[styles.saveButtonText, isSaving && styles.saveButtonTextDisabled]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          )
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consultation Topics</Text>
            <Text style={styles.sectionDescription}>
              Add topics you can help with and set individual pricing
            </Text>
            <TopicManager 
              topics={topics}
              onTopicsChange={setTopics}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Available for Booking</Text>
                <Text style={styles.settingDescription}>
                  Allow others to book consultations with you
                </Text>
              </View>
              <Switch
                value={isAvailableForBooking}
                onValueChange={setIsAvailableForBooking}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Advance Booking</Text>
                <Text style={styles.settingDescription}>
                  How many days in advance can people book? Currently: {advanceBookingDays} days
                </Text>
              </View>
              <View style={styles.advanceBookingControls}>
                <TouchableOpacity 
                  style={styles.advanceButton}
                  onPress={() => setAdvanceBookingDays(Math.max(1, advanceBookingDays - 1))}
                >
                  <Text style={styles.advanceButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.advanceValue}>{advanceBookingDays}</Text>
                <TouchableOpacity 
                  style={styles.advanceButton}
                  onPress={() => setAdvanceBookingDays(Math.min(30, advanceBookingDays + 1))}
                >
                  <Text style={styles.advanceButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.text} />
              <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Set your available hours for each day of the week
            </Text>
            
            <View style={styles.timeSlotsList}>
              {daySchedules.map(renderDaySchedule)}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                setDaySchedules(prev => 
                  prev.map(schedule => ({ ...schedule, isEnabled: true }))
                );
              }}
            >
              <Text style={styles.quickActionText}>Enable All Days</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                setDaySchedules(prev => 
                  prev.map(schedule => ({ 
                    ...schedule, 
                    isEnabled: schedule.day !== 'Saturday' && schedule.day !== 'Sunday'
                  }))
                );
              }}
            >
              <Text style={styles.quickActionText}>Weekdays Only</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, styles.quickActionDanger]}
              onPress={() => {
                setDaySchedules(prev => 
                  prev.map(schedule => ({ ...schedule, isEnabled: false }))
                );
              }}
            >
              <Text style={[styles.quickActionText, styles.quickActionDangerText]}>Disable All Days</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <Modal
          visible={timePickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.timePickerModal}>
              <View style={styles.timePickerHeader}>
                <Text style={styles.timePickerTitle}>
                  Select {selectedTimeSlot?.type === 'start' ? 'Start' : 'End'} Time
                </Text>
                <TouchableOpacity
                  onPress={() => setTimePickerVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={TIME_OPTIONS}
                renderItem={renderTimePickerItem}
                keyExtractor={(item) => item}
                style={styles.timePickerList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  advanceBookingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  advanceButton: {
    width: 32,
    height: 32,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  advanceButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  advanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  timeSlotsList: {
    gap: 16,
  },
  timeSlotItem: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  intervalsContainer: {
    gap: 12,
  },
  intervalRow: {
    gap: 8,
  },
  addIntervalButton: {
    alignSelf: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  removeIntervalButton: {
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeIntervalText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
  },
  quickAction: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionDanger: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '30',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  quickActionDangerText: {
    color: Colors.error,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  timePickerList: {
    flex: 1,
  },
  timePickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timePickerText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButtonTextDisabled: {
    color: Colors.textLight,
  },
});
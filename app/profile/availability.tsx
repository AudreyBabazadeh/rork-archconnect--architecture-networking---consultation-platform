import { Clock, Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { TopicManager } from '@/components/TopicManager';
import { Topic } from '@/types/user';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
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

export default function ManageAvailabilityScreen() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>((user as any)?.topics || []);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    DAYS_OF_WEEK.map(day => ({
      id: day.toLowerCase(),
      day,
      startTime: '09:00',
      endTime: '17:00',
      isEnabled: day !== 'Saturday' && day !== 'Sunday'
    }))
  );
  const [isAvailableForBooking, setIsAvailableForBooking] = useState(true);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(7);

  const toggleTimeSlot = (dayId: string) => {
    setTimeSlots(prev => 
      prev.map(slot => 
        slot.id === dayId 
          ? { ...slot, isEnabled: !slot.isEnabled }
          : slot
      )
    );
  };

  const renderTimeSlot = (slot: TimeSlot) => (
    <View key={slot.id} style={styles.timeSlotItem}>
      <View style={styles.timeSlotHeader}>
        <Text style={styles.dayLabel}>{slot.day}</Text>
        <Switch
          value={slot.isEnabled}
          onValueChange={() => toggleTimeSlot(slot.id)}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>
      
      {slot.isEnabled && (
        <View style={styles.timeInputs}>
          <View style={styles.timeInputGroup}>
            <Text style={styles.timeLabel}>From</Text>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => {
                // In a real app, you'd show a time picker here
                Alert.alert('Time Picker', 'Time picker would open here');
              }}
            >
              <Clock size={16} color={Colors.textLight} />
              <Text style={styles.timeText}>{slot.startTime}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeInputGroup}>
            <Text style={styles.timeLabel}>To</Text>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => {
                // In a real app, you'd show a time picker here
                Alert.alert('Time Picker', 'Time picker would open here');
              }}
            >
              <Clock size={16} color={Colors.textLight} />
              <Text style={styles.timeText}>{slot.endTime}</Text>
            </TouchableOpacity>
          </View>
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
      <Stack.Screen options={{ title: 'Manage Availability' }} />
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
            {timeSlots.map(renderTimeSlot)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              setTimeSlots(prev => 
                prev.map(slot => ({ ...slot, isEnabled: true }))
              );
            }}
          >
            <Text style={styles.quickActionText}>Enable All Days</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => {
              setTimeSlots(prev => 
                prev.map(slot => ({ 
                  ...slot, 
                  isEnabled: slot.day !== 'Saturday' && slot.day !== 'Sunday'
                }))
              );
            }}
          >
            <Text style={styles.quickActionText}>Weekdays Only</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, styles.quickActionDanger]}
            onPress={() => {
              setTimeSlots(prev => 
                prev.map(slot => ({ ...slot, isEnabled: false }))
              );
            }}
          >
            <Text style={[styles.quickActionText, styles.quickActionDangerText]}>Disable All Days</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});
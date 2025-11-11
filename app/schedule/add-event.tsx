import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Calendar, Clock, MapPin, AlignLeft, Save } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { formatTimeTo12Hour } from '@/constants/timeUtils';
import { useSchedule } from '@/contexts/ScheduleContext';

export default function AddEventScreen() {
  const { addEvent } = useSchedule();
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('60');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const renderCalendar = () => {
    const currentDate = new Date(date);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(year, month - 1, 1);
              setDate(newDate.toISOString().split('T')[0]);
            }}
            style={styles.calendarNavButton}
          >
            <Text style={styles.calendarNavText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>
            {monthNames[month]} {year}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(year, month + 1, 1);
              setDate(newDate.toISOString().split('T')[0]);
            }}
            style={styles.calendarNavButton}
          >
            <Text style={styles.calendarNavText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarDaysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.calendarDayLabel}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarDaysGrid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.calendarDay} />;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === date;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.calendarDay,
                  isSelected && styles.calendarDaySelected,
                  isToday && !isSelected && styles.calendarDayToday,
                ]}
                onPress={() => handleDateSelect(dateStr)}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isSelected && styles.calendarDayTextSelected,
                    isToday && !isSelected && styles.calendarDayTextToday,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an event title');
      return;
    }

    if (!date) {
      Alert.alert('Required', 'Please select a date');
      return;
    }

    addEvent({
      title,
      date,
      time,
      duration: parseInt(duration) || 60,
      location: location || undefined,
      description: description || undefined,
    });

    Alert.alert(
      'Event Created',
      `${title} has been added to your schedule on ${new Date(date).toLocaleDateString()}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const quickDurations = [30, 60, 90, 120];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Event',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Team Meeting, Conference Call..."
            placeholderTextColor={Colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={20} color={Colors.textSecondary} />
            <Text style={styles.inputButtonText}>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && renderCalendar()}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowTimePicker(!showTimePicker)}
          >
            <Clock size={20} color={Colors.textSecondary} />
            <Text style={styles.inputButtonText}>{formatTimeTo12Hour(time)}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <View style={styles.timeGrid}>
              {Array.from({ length: 24 }, (_, i) => i).map((hour) =>
                ['00', '30'].map((minute) => {
                  const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
                  const isSelected = time === timeValue;
                  return (
                    <TouchableOpacity
                      key={timeValue}
                      style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                      onPress={() => {
                        setTime(timeValue);
                        setShowTimePicker(false);
                      }}
                    >
                      <Text
                        style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}
                      >
                        {formatTimeTo12Hour(timeValue)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <View style={styles.durationContainer}>
            {quickDurations.map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.durationButton,
                  duration === mins.toString() && styles.durationButtonActive,
                ]}
                onPress={() => setDuration(mins.toString())}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === mins.toString() && styles.durationTextActive,
                  ]}
                >
                  {mins} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Custom duration (minutes)"
            placeholderTextColor={Colors.textSecondary}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.inputWithIconField}
              placeholder="e.g., Conference Room, Video Call..."
              placeholderTextColor={Colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <View style={styles.inputWithIcon}>
            <AlignLeft size={20} color={Colors.textSecondary} />
            <TextInput
              style={[styles.inputWithIconField, styles.textArea]}
              placeholder="Add notes, agenda, or other details..."
              placeholderTextColor={Colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>Save Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputButtonText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWithIconField: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  durationTextActive: {
    color: Colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    maxHeight: 200,
  },
  timeSlot: {
    width: '22%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  timeSlotTextSelected: {
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  calendarContainer: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarNavText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  calendarDaySelected: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  calendarDayTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

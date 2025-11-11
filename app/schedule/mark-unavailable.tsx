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
import { Calendar, Clock, AlignLeft, Save, CalendarOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { formatTimeTo12Hour } from '@/constants/timeUtils';

type DurationType = 'full-day' | 'partial-day' | 'date-range';

export default function MarkUnavailableScreen() {
  const [durationType, setDurationType] = useState<DurationType>('full-day');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [reason, setReason] = useState<string>('');
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

  const handleStartDateSelect = (selectedDate: string) => {
    setStartDate(selectedDate);
    setShowStartDatePicker(false);
  };

  const handleEndDateSelect = (selectedDate: string) => {
    setEndDate(selectedDate);
    setShowEndDatePicker(false);
  };

  const renderCalendar = (date: string, onSelectDate: (date: string) => void, onChangeMonth: (date: string) => void) => {
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
              onChangeMonth(newDate.toISOString().split('T')[0]);
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
              onChangeMonth(newDate.toISOString().split('T')[0]);
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
                onPress={() => onSelectDate(dateStr)}
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

  const handleSave = () => {
    if (!startDate) {
      Alert.alert('Required', 'Please select a date');
      return;
    }

    if (durationType === 'date-range' && !endDate) {
      Alert.alert('Required', 'Please select an end date');
      return;
    }

    let message = '';
    if (durationType === 'full-day') {
      message = `You will be marked unavailable on ${new Date(startDate).toLocaleDateString()}`;
    } else if (durationType === 'partial-day') {
      message = `You will be marked unavailable on ${new Date(
        startDate
      ).toLocaleDateString()} from ${formatTimeTo12Hour(startTime)} to ${formatTimeTo12Hour(
        endTime
      )}`;
    } else {
      message = `You will be marked unavailable from ${new Date(
        startDate
      ).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    }

    Alert.alert('Out of Office Set', message, [{ text: 'OK', onPress: () => router.back() }]);
  };

  const durationTypes: { value: DurationType; label: string; description: string }[] = [
    {
      value: 'full-day',
      label: 'Full Day',
      description: 'Block an entire day',
    },
    {
      value: 'partial-day',
      label: 'Partial Day',
      description: 'Block specific hours',
    },
    {
      value: 'date-range',
      label: 'Date Range',
      description: 'Block multiple days',
    },
  ];

  const commonReasons = [
    'Vacation',
    'Out of office',
    'Personal time',
    'Business trip',
    'Meeting',
    'Focus time',
  ];

  const renderTimeSelector = (
    label: string,
    value: string,
    showPicker: boolean,
    setShowPicker: (show: boolean) => void,
    setValue: (value: string) => void
  ) => (
    <View style={styles.timeSelector}>
      <Text style={styles.timeSelectorLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.inputButton}
        onPress={() => setShowPicker(!showPicker)}
      >
        <Clock size={20} color={Colors.textSecondary} />
        <Text style={styles.inputButtonText}>{formatTimeTo12Hour(value)}</Text>
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.timeGrid}>
          {Array.from({ length: 24 }, (_, i) => i).map((hour) =>
            ['00', '30'].map((minute) => {
              const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
              const isSelected = value === timeValue;
              return (
                <TouchableOpacity
                  key={timeValue}
                  style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                  onPress={() => {
                    setValue(timeValue);
                    setShowPicker(false);
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Mark Unavailable',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <CalendarOff size={32} color={Colors.primary} />
          </View>
          <Text style={styles.iconHeaderText}>Mark out of office</Text>
          <Text style={styles.iconHeaderSubtext}>
            Block time when you're unavailable for bookings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration Type</Text>
          {durationTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.durationTypeCard,
                durationType === type.value && styles.durationTypeCardActive,
              ]}
              onPress={() => setDurationType(type.value)}
            >
              <View style={styles.radioOuter}>
                {durationType === type.value && <View style={styles.radioInner} />}
              </View>
              <View style={styles.durationTypeContent}>
                <Text
                  style={[
                    styles.durationTypeLabel,
                    durationType === type.value && styles.durationTypeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
                <Text style={styles.durationTypeDescription}>{type.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {durationType === 'full-day' && (
          <View style={styles.section}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowStartDatePicker(!showStartDatePicker)}
            >
              <Calendar size={20} color={Colors.textSecondary} />
              <Text style={styles.inputButtonText}>
                {new Date(startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            {showStartDatePicker && renderCalendar(startDate, handleStartDateSelect, setStartDate)}
          </View>
        )}

        {durationType === 'partial-day' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => setShowStartDatePicker(!showStartDatePicker)}
              >
                <Calendar size={20} color={Colors.textSecondary} />
                <Text style={styles.inputButtonText}>
                  {new Date(startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              {showStartDatePicker && renderCalendar(startDate, handleStartDateSelect, setStartDate)}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Time Range</Text>
              <View style={styles.timeRangeContainer}>
                {renderTimeSelector(
                  'From',
                  startTime,
                  showStartTimePicker,
                  setShowStartTimePicker,
                  setStartTime
                )}
                {renderTimeSelector(
                  'To',
                  endTime,
                  showEndTimePicker,
                  setShowEndTimePicker,
                  setEndTime
                )}
              </View>
            </View>
          </>
        )}

        {durationType === 'date-range' && (
          <View style={styles.section}>
            <Text style={styles.label}>Date Range *</Text>
            <View style={styles.dateRangeContainer}>
              <View style={styles.dateRangeItem}>
                <Text style={styles.dateRangeLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => {
                    setShowStartDatePicker(!showStartDatePicker);
                    setShowEndDatePicker(false);
                  }}
                >
                  <Calendar size={20} color={Colors.textSecondary} />
                  <Text style={styles.inputButtonText}>
                    {new Date(startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
                {showStartDatePicker && renderCalendar(startDate, handleStartDateSelect, setStartDate)}
              </View>

              <View style={styles.dateRangeItem}>
                <Text style={styles.dateRangeLabel}>End Date</Text>
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => {
                    setShowEndDatePicker(!showEndDatePicker);
                    setShowStartDatePicker(false);
                  }}
                >
                  <Calendar size={20} color={Colors.textSecondary} />
                  <Text style={styles.inputButtonText}>
                    {new Date(endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
                {showEndDatePicker && renderCalendar(endDate, handleEndDateSelect, setEndDate)}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Reason (Optional)</Text>
          <View style={styles.quickReasons}>
            {commonReasons.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.quickReasonButton, reason === r && styles.quickReasonButtonActive]}
                onPress={() => setReason(r)}
              >
                <Text
                  style={[styles.quickReasonText, reason === r && styles.quickReasonTextActive]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputWithIcon}>
            <AlignLeft size={20} color={Colors.textSecondary} />
            <TextInput
              style={[styles.inputWithIconField, styles.textArea]}
              placeholder="Custom reason or additional notes..."
              placeholderTextColor={Colors.textSecondary}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>What happens when you're unavailable?</Text>
          <Text style={styles.infoCardText}>
            • Your calendar will show blocked time{'\n'}
            • New booking requests will be prevented{'\n'}
            • Existing bookings will not be affected{'\n'}
            • You can edit or remove this block anytime
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>Mark Unavailable</Text>
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
  iconHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  iconHeaderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  durationTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  durationTypeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}05`,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  durationTypeContent: {
    flex: 1,
  },
  durationTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  durationTypeLabelActive: {
    color: Colors.primary,
  },
  durationTypeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  timeRangeContainer: {
    gap: 16,
  },
  timeSelector: {
    marginBottom: 12,
  },
  timeSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
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
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateRangeItem: {
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  quickReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickReasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickReasonButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickReasonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  quickReasonTextActive: {
    color: Colors.white,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoCard: {
    backgroundColor: `${Colors.primary}05`,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
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

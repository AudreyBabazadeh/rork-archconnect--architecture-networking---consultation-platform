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
  Switch,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Calendar, Flag, AlignLeft, Save, CheckSquare, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSchedule } from '@/contexts/ScheduleContext';

type Priority = 'low' | 'medium' | 'high';

export default function AddTaskScreen() {
  const { addTask } = useSchedule();
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hasSpecificTime, setHasSpecificTime] = useState<boolean>(false);
  const [time, setTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('30');
  const [priority, setPriority] = useState<Priority>('medium');
  const [description, setDescription] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

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

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const renderTimePicker = () => {
    const times = generateTimeOptions();
    return (
      <ScrollView style={styles.timePickerContainer}>
        {times.map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.timeOption,
              time === t && styles.timeOptionSelected,
            ]}
            onPress={() => {
              setTime(t);
              setShowTimePicker(false);
            }}
          >
            <Text
              style={[
                styles.timeOptionText,
                time === t && styles.timeOptionTextSelected,
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title');
      return;
    }

    if (!date) {
      Alert.alert('Required', 'Please select a date');
      return;
    }

    if (hasSpecificTime && (!time || !duration)) {
      Alert.alert('Required', 'Please select time and duration');
      return;
    }

    addTask({
      title,
      date,
      priority,
      description: description || undefined,
      time: hasSpecificTime ? time : undefined,
      duration: hasSpecificTime ? parseInt(duration) : undefined,
    });

    Alert.alert(
      'Task Created',
      `${title} has been added to your tasks for ${new Date(date).toLocaleDateString()}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: Colors.success },
    { value: 'medium', label: 'Medium', color: Colors.warning },
    { value: 'high', label: 'High', color: Colors.error },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Task',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <CheckSquare size={32} color={Colors.primary} />
          </View>
          <Text style={styles.iconHeaderText}>Create a new task</Text>
          <Text style={styles.iconHeaderSubtext}>
            Keep track of your to-dos and stay organized
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Prepare presentation, Review documents..."
            placeholderTextColor={Colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Due Date *</Text>
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
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Clock size={20} color={Colors.text} />
              <Text style={styles.label}>Schedule specific time</Text>
            </View>
            <Switch
              value={hasSpecificTime}
              onValueChange={setHasSpecificTime}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          {hasSpecificTime && (
            <View style={styles.timeSection}>
              <View style={styles.timeRow}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>Time</Text>
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={() => setShowTimePicker(!showTimePicker)}
                  >
                    <Clock size={20} color={Colors.textSecondary} />
                    <Text style={styles.inputButtonText}>{time}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>Duration (mins)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor={Colors.textSecondary}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {showTimePicker && renderTimePicker()}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityButton,
                  priority === p.value && {
                    backgroundColor: p.color,
                    borderColor: p.color,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Flag
                  size={18}
                  color={priority === p.value ? Colors.white : p.color}
                  fill={priority === p.value ? Colors.white : 'none'}
                />
                <Text
                  style={[
                    styles.priorityText,
                    { color: priority === p.value ? Colors.white : p.color },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <View style={styles.inputWithIcon}>
            <AlignLeft size={20} color={Colors.textSecondary} />
            <TextInput
              style={[styles.inputWithIconField, styles.textArea]}
              placeholder="Add task details, notes, or checklist items..."
              placeholderTextColor={Colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Task Tips</Text>
          <Text style={styles.infoCardText}>
            • Break large tasks into smaller, actionable steps{'\n'}
            • Set realistic due dates to avoid overwhelm{'\n'}
            • Use priorities to focus on what matters most{'\n'}
            • Review and update your tasks regularly
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>Save Task</Text>
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    gap: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSection: {
    marginTop: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  timePickerContainer: {
    marginTop: 12,
    maxHeight: 200,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeOptionSelected: {
    backgroundColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  timeOptionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
});

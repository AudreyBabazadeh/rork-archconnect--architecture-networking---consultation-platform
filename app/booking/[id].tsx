import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { DollarSign } from 'lucide-react-native';
import { mockUsers } from '@/data/mockUsers';
import { PaymentModal } from '@/components/PaymentModal';
import { Colors } from '@/constants/colors';

const consultationTypes = [
  { id: 'portfolio', title: 'Portfolio Review', duration: 60, description: 'Comprehensive review of your work' },
  { id: 'project', title: 'Project Consultation', duration: 45, description: 'Specific project guidance' },
  { id: 'career', title: 'Career Advice', duration: 30, description: 'Professional development discussion' },
  { id: 'technical', title: 'Technical Help', duration: 90, description: 'Software and technical assistance' },
];

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(consultationTypes[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const consultant = mockUsers.find(user => user.id === id);
  
  if (!consultant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Consultant not found</Text>
      </SafeAreaView>
    );
  }

  const totalPrice = (consultant.hourlyRate * selectedType.duration) / 60;
  const platformFee = totalPrice * 0.05; // 5% platform fee
  const finalPrice = totalPrice + platformFee;

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select a date and time for your consultation.');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    Alert.alert(
      'Booking Confirmed!',
      `Your ${selectedType.title} with ${consultant.name} has been successfully booked for ${selectedDate} at ${selectedTime}.`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Book Consultation',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.consultantInfo}>
          <Text style={styles.consultantName}>{consultant.name}</Text>
          <Text style={styles.consultantTitle}>{consultant.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          {consultationTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeOption, selectedType.id === type.id && styles.selectedOption]}
              onPress={() => setSelectedType(type)}
            >
              <View style={styles.typeInfo}>
                <Text style={[styles.typeTitle, selectedType.id === type.id && styles.selectedText]}>
                  {type.title}
                </Text>
                <Text style={[styles.typeDescription, selectedType.id === type.id && styles.selectedText]}>
                  {type.description}
                </Text>
              </View>
              <View style={styles.typeDetails}>
                <Text style={[styles.typeDuration, selectedType.id === type.id && styles.selectedText]}>
                  {type.duration} min
                </Text>
                <Text style={[styles.typePrice, selectedType.id === type.id && styles.selectedText]}>
                  ${((consultant.hourlyRate * type.duration) / 60).toFixed(0)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {Array.from({ length: 14 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i + 1);
              const dateString = date.toISOString().split('T')[0];
              const displayDate = date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              });
              
              return (
                <TouchableOpacity
                  key={dateString}
                  style={[styles.dateOption, selectedDate === dateString && styles.selectedOption]}
                  onPress={() => setSelectedDate(dateString)}
                >
                  <Text style={[styles.dateText, selectedDate === dateString && styles.selectedText]}>
                    {displayDate}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeOption, selectedTime === time && styles.selectedOption]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.selectedText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe what you'd like to discuss..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Consultation ({selectedType.duration} min)</Text>
            <Text style={styles.priceValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform fee (5%)</Text>
            <Text style={styles.priceValue}>${platformFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${finalPrice.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <TouchableOpacity 
          style={[styles.bookButton, (!selectedDate || !selectedTime) && styles.disabledButton]}
          onPress={handleBooking}
          disabled={!selectedDate || !selectedTime}
        >
          <DollarSign size={20} color={Colors.white} />
          <Text style={styles.bookButtonText}>Book for ${finalPrice.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={finalPrice}
        consultantName={consultant.name}
        consultationType={selectedType.title}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
  },
  consultantInfo: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  consultantName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  consultantTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  typeDetails: {
    alignItems: 'flex-end',
  },
  typeDuration: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  typePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedText: {
    color: Colors.primary,
  },
  dateScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomAction: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
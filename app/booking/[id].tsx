import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { DollarSign } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers } from '@/data/mockUsers';
import { PaymentModal } from '@/components/PaymentModal';
import { Colors } from '@/constants/colors';
import { Service } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

const defaultServices: Service[] = [
  { id: 'portfolio', name: 'Portfolio Review', duration: 60, description: 'Comprehensive review of your work', price: 50, isActive: true },
  { id: 'project', name: 'Project Session', duration: 45, description: 'Specific project guidance', price: 40, isActive: true },
  { id: 'career', name: 'Career Advice', duration: 30, description: 'Professional development discussion', price: 25, isActive: true },
  { id: 'technical', name: 'Technical Help', duration: 90, description: 'Software and technical assistance', price: 75, isActive: true },
];

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getUserById } = useAuth();
  const [consultant, setConsultant] = useState<any>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load consultant data and services
  useEffect(() => {
    const loadConsultantAndServices = async () => {
      try {
        let foundConsultant = null;
        
        // First check mock users
        foundConsultant = mockUsers.find(user => user.id === id);
        
        if (!foundConsultant) {
          // Try to get user from cloud
          if (getUserById) {
            try {
              const cloudUser = await getUserById(id as string);
              if (cloudUser) {
                foundConsultant = {
                  id: cloudUser.id,
                  name: cloudUser.name,
                  title: cloudUser.userType === 'professor' ? `Professor at ${cloudUser.university || 'University'}` : `${cloudUser.userType === 'student' ? 'Architecture Student' : 'Architecture Professional'}`,
                  university: cloudUser.university,
                  location: cloudUser.location || 'Location not specified',
                  avatar: cloudUser.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                  specialties: cloudUser.specialization ? [cloudUser.specialization] : ['General Architecture'],
                  experience: cloudUser.experience || '1 year',
                  hourlyRate: cloudUser.hourlyRate || 25,
                  rating: cloudUser.rating || 4.5,
                  reviewCount: (cloudUser as any).totalConsultations || 0,
                  bio: cloudUser.bio || 'Architecture professional ready to help with your projects.',
                  isAvailable: true,
                  services: cloudUser.services || defaultServices
                };
              }
            } catch {
              console.log('Cloud search failed, trying local storage');
            }
          }
        }
        
        // Fallback to local storage
        if (!foundConsultant) {
          const storedUsers = await AsyncStorage.getItem('app_users_local');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const realUser = users.find((u: any) => u.id === id);
            
            if (realUser) {
              foundConsultant = {
                id: realUser.id,
                name: realUser.name,
                title: realUser.userType === 'professor' ? `Professor at ${realUser.university || 'University'}` : `${realUser.userType === 'student' ? 'Architecture Student' : 'Architecture Professional'}`,
                university: realUser.university,
                location: realUser.location || 'Location not specified',
                avatar: realUser.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                specialties: realUser.specialization ? [realUser.specialization] : ['General Architecture'],
                experience: realUser.experience || '1 year',
                hourlyRate: realUser.hourlyRate || 25,
                rating: realUser.rating || 4.5,
                reviewCount: realUser.totalConsultations || 0,
                bio: realUser.bio || 'Architecture professional ready to help with your projects.',
                isAvailable: true,
                services: realUser.services || defaultServices
              };
            }
          }
        }
        
        if (foundConsultant) {
          setConsultant(foundConsultant);
          const services = foundConsultant.services || defaultServices;
          const activeServices = services.filter((s: Service) => s.isActive);
          setAvailableServices(activeServices);
          if (activeServices.length > 0) {
            setSelectedService(activeServices[0]);
          }
        }
      } catch (error) {
        console.error('Error loading consultant:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConsultantAndServices();
  }, [id, getUserById]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!consultant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Consultant not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (availableServices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No services available</Text>
          <Text style={styles.errorSubtext}>This consultant hasn&apos;t set up any services yet.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = selectedService?.price || 0;
  const platformFee = totalPrice * 0.05; // 5% platform fee
  const finalPrice = totalPrice + platformFee;

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select a date and time for your session.');
      return;
    }

    if (!selectedService) {
      Alert.alert('Missing Information', 'Please select a service.');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    Alert.alert(
      'Booking Confirmed!',
      `Your ${selectedService?.name} session with ${consultant.name} has been successfully booked for ${selectedDate} at ${selectedTime}.`,
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
          title: 'Book Session',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.consultantInfo}>
          <Text style={styles.consultantName}>{consultant.name}</Text>
          <Text style={styles.consultantTitle}>{consultant.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Service</Text>
          {availableServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.typeOption, selectedService?.id === service.id && styles.selectedOption]}
              onPress={() => setSelectedService(service)}
            >
              <View style={styles.typeInfo}>
                <Text style={[styles.typeTitle, selectedService?.id === service.id && styles.selectedText]}>
                  {service.name}
                </Text>
                <Text style={[styles.typeDescription, selectedService?.id === service.id && styles.selectedText]}>
                  {service.description}
                </Text>
              </View>
              <View style={styles.typeDetails}>
                <Text style={[styles.typeDuration, selectedService?.id === service.id && styles.selectedText]}>
                  {service.duration} min
                </Text>
                <Text style={[styles.typePrice, selectedService?.id === service.id && styles.selectedText]}>
                  ${service.price}
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
            placeholder="Describe what you&apos;d like to discuss..."
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
            <Text style={styles.priceLabel}>Session ({selectedService?.duration || 0} min)</Text>
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
          style={[styles.bookButton, (!selectedDate || !selectedTime || !selectedService) && styles.disabledButton]}
          onPress={handleBooking}
          disabled={!selectedDate || !selectedTime || !selectedService}
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
        consultationType={selectedService?.name || ''}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
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
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, MapPin, Clock, MessageCircle, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers } from '@/data/mockUsers';
import { ReviewsComponent } from '@/components/ReviewsComponent';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/contexts/MessagingContext';

const { width } = Dimensions.get('window');
const USERS_STORAGE_KEY = 'app_users';

export default function ConsultantProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser, getUserById } = useAuth();
  const { getOrCreateConversation } = useMessaging();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [consultant, setConsultant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load consultant data from cloud, local storage, and mock users
  useEffect(() => {
    const loadConsultant = async () => {
      try {
        let foundConsultant = null;
        
        // First check mock users
        foundConsultant = mockUsers.find(user => user.id === id);
        
        if (!foundConsultant) {
          // Try to get user from cloud using getUserById
          if (getUserById) {
            try {
              const cloudUser = await getUserById(id as string);
              if (cloudUser) {
                // Convert auth user to display format
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
                  reviewCount: cloudUser.totalConsultations || 0,
                  bio: cloudUser.bio || 'Architecture professional ready to help with your projects.',
                  isAvailable: true,
                  portfolio: Array.isArray(cloudUser.portfolio) ? cloudUser.portfolio.map((item: string, index: number) => ({
                    id: `portfolio-${index}`,
                    title: `Project ${index + 1}`,
                    category: 'Architecture',
                    year: new Date().getFullYear().toString(),
                    description: 'Portfolio project',
                    images: [item]
                  })) : []
                };
                console.log('Found consultant in cloud:', foundConsultant.name);
              }
            } catch (cloudError) {
              console.log('Cloud search failed, trying local storage');
            }
          }
        }
        
        // Fallback to local storage if not found in cloud
        if (!foundConsultant) {
          const storedUsers = await AsyncStorage.getItem('app_users_local');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const realUser = users.find((u: any) => u.id === id);
            
            if (realUser) {
              // Convert auth user to display format
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
                portfolio: Array.isArray(realUser.portfolio) ? realUser.portfolio.map((item: string, index: number) => ({
                  id: `portfolio-${index}`,
                  title: `Project ${index + 1}`,
                  category: 'Architecture',
                  year: new Date().getFullYear().toString(),
                  description: 'Portfolio project',
                  images: [item]
                })) : []
              };
              console.log('Found consultant in local storage:', foundConsultant.name);
            }
          }
        }
        
        setConsultant(foundConsultant);
      } catch (error) {
        console.error('Error loading consultant:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConsultant();
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

  const allImages = consultant.portfolio.flatMap((item: any) => item.images || []);

  const handleBookConsultation = () => {
    router.push(`/booking/${consultant.id}`);
  };

  const handleMessage = async () => {
    if (!currentUser || !consultant) return;
    
    try {
      const conversationId = await getOrCreateConversation(
        consultant.id,
        consultant.name,
        consultant.avatar
      );
      router.push(`/chat/${conversationId}` as any);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: consultant.name,
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={{ uri: consultant.avatar }} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{consultant.name}</Text>
            <Text style={styles.title}>{consultant.title}</Text>
            {consultant.university && (
              <Text style={styles.university}>{consultant.university}</Text>
            )}
            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.location}>{consultant.location}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={16} color={Colors.secondary} fill={Colors.secondary} />
              <Text style={styles.rating}>{consultant.rating}</Text>
              <Text style={styles.reviewCount}>({consultant.reviewCount} reviews)</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${consultant.hourlyRate}</Text>
            <Text style={styles.priceLabel}>per hour</Text>
            <View style={[styles.statusBadge, { backgroundColor: consultant.isAvailable ? Colors.success : Colors.textLight }]}>
              <Text style={styles.statusText}>
                {consultant.isAvailable ? 'Available' : 'Busy'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.specialties}>
            {consultant.specialties.map((specialty: string, index: number) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{consultant.bio}</Text>
          <View style={styles.experienceRow}>
            <Clock size={16} color={Colors.textLight} />
            <Text style={styles.experience}>{consultant.experience} of experience</Text>
          </View>
        </View>

        {allImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
                setSelectedImageIndex(index);
              }}
            >
              {allImages.map((image: string, index: number) => (
                <Image 
                  key={index}
                  source={{ uri: image }} 
                  style={styles.portfolioImage}
                />
              ))}
            </ScrollView>
            <View style={styles.imageIndicators}>
              {allImages.map((_: string, index: number) => (
                <View 
                  key={index}
                  style={[
                    styles.indicator,
                    index === selectedImageIndex && styles.activeIndicator
                  ]} 
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.portfolioProjects}>
          {consultant.portfolio.map((project: any, index: number) => (
            <View key={project.id || index} style={styles.projectCard}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectCategory}>{project.category} • {project.year}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
        </View>
        <ReviewsComponent 
          reviews={[]} 
          averageRating={consultant.rating} 
          totalReviews={consultant.reviewCount} 
        />
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.messageButton} 
          onPress={handleMessage}
        >
          <MessageCircle size={20} color={Colors.primary} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bookButton, !consultant.isAvailable && styles.disabledButton]} 
          onPress={handleBookConsultation}
          disabled={!consultant.isAvailable}
        >
          <Calendar size={20} color={Colors.white} />
          <Text style={styles.bookButtonText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  university: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500',
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
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specialtyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  experience: {
    fontSize: 14,
    color: Colors.textLight,
  },
  portfolioImage: {
    width: width - 40,
    height: 240,
    borderRadius: 12,
    marginRight: 16,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
  },
  portfolioProjects: {
    backgroundColor: Colors.white,
    marginTop: 8,
    padding: 20,
  },
  projectCard: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  bookButton: {
    flex: 2,
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
});
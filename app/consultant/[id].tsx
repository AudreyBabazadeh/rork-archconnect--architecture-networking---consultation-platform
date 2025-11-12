import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, MapPin, Clock, MessageCircle, Calendar, UserPlus, UserMinus, Share2, ExternalLink, Linkedin, Globe, Instagram } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers } from '@/data/mockUsers';
import { ReviewsComponent } from '@/components/ReviewsComponent';
import { LoyaltyBadge } from '@/components/LoyaltyBadge';
import { PricingTierBadge } from '@/components/PricingTierBadge';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/contexts/MessagingContext';
import { useFollow } from '@/contexts/FollowContext';
import { ShareModal } from '@/components/ShareModal';
import { PortfolioGallery } from '@/components/PortfolioGallery';

export default function ConsultantProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser, getUserById } = useAuth();
  const { getOrCreateConversation } = useMessaging();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const [consultant, setConsultant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
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
                  pricingTier: (cloudUser as any).pricingTier || 'Moderate',
                  rating: cloudUser.rating || 4.5,
                  reviewCount: (cloudUser as any).totalConsultations || 0,
                  bio: cloudUser.bio || 'Architecture professional ready to help with your projects.',
                  isAvailable: true,
                  linkedIn: (cloudUser as any).linkedIn || '',
                  website: (cloudUser as any).website || '',
                  instagram: (cloudUser as any).instagram || '',
                  externalPortfolio: (cloudUser as any).externalPortfolio || '',
                  portfolio: Array.isArray((cloudUser as any).portfolio) ? (cloudUser as any).portfolio.map((item: string, index: number) => ({
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
            } catch {
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
                pricingTier: realUser.pricingTier || 'Moderate',
                rating: realUser.rating || 4.5,
                reviewCount: realUser.totalConsultations || 0,
                bio: realUser.bio || 'Architecture professional ready to help with your projects.',
                isAvailable: true,
                linkedIn: realUser.linkedIn || '',
                website: realUser.website || '',
                instagram: realUser.instagram || '',
                externalPortfolio: realUser.externalPortfolio || '',
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
      router.push(`/messages/${conversationId}` as any);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const openLink = async (url: string, label: string) => {
    if (!url) return;
    
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    
    try {
      const canOpen = await Linking.canOpenURL(finalUrl);
      if (canOpen) {
        await Linking.openURL(finalUrl);
      } else {
        Alert.alert('Error', `Cannot open ${label}`);
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', `Failed to open ${label}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: consultant.name,
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={{ marginRight: 8 }}>
              <Share2 size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={{ uri: consultant.avatar }} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{consultant.name}</Text>
              {consultant.loyaltyBadge && (
                <LoyaltyBadge badge={consultant.loyaltyBadge} size={18} />
              )}
            </View>
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
          <View style={styles.tierContainer}>
            {consultant.pricingTier && (
              <View style={styles.tierBadgeWrapper}>
                <PricingTierBadge tier={consultant.pricingTier} size={10} />
              </View>
            )}
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
            <PortfolioGallery
              images={allImages.map((image: string, index: number) => ({
                id: `portfolio-image-${index}`,
                uri: image,
                caption: consultant.portfolio[Math.floor(index / consultant.portfolio[0]?.images?.length || 1)]?.title || '',
              }))}
              accentColor={Colors.primary}
              layout="grid"
            />
          </View>
        )}

        {consultant.portfolio && consultant.portfolio.length > 0 && (
          <View style={styles.portfolioProjects}>
            {consultant.portfolio.map((project: any, index: number) => (
              <View key={project.id || index} style={styles.projectCard}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectCategory}>{project.category} • {project.year}</Text>
                <Text style={styles.projectDescription}>{project.description}</Text>
              </View>
            ))}
          </View>
        )}

        {(consultant.linkedIn || consultant.website || consultant.instagram || consultant.externalPortfolio) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect</Text>
            {consultant.linkedIn && (
              <TouchableOpacity 
                style={styles.linkRow} 
                onPress={() => openLink(consultant.linkedIn, 'LinkedIn')}
                activeOpacity={0.7}
              >
                <Linkedin size={20} color={Colors.primary} />
                <Text style={styles.linkText} numberOfLines={1}>LinkedIn</Text>
                <ExternalLink size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
            {consultant.website && (
              <TouchableOpacity 
                style={styles.linkRow} 
                onPress={() => openLink(consultant.website, 'Website')}
                activeOpacity={0.7}
              >
                <Globe size={20} color={Colors.primary} />
                <Text style={styles.linkText} numberOfLines={1}>Website</Text>
                <ExternalLink size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
            {consultant.instagram && (
              <TouchableOpacity 
                style={styles.linkRow} 
                onPress={() => openLink(consultant.instagram, 'Instagram')}
                activeOpacity={0.7}
              >
                <Instagram size={20} color={Colors.primary} />
                <Text style={styles.linkText} numberOfLines={1}>Instagram</Text>
                <ExternalLink size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
            {consultant.externalPortfolio && (
              <TouchableOpacity 
                style={styles.linkRow} 
                onPress={() => openLink(consultant.externalPortfolio, 'Portfolio')}
                activeOpacity={0.7}
              >
                <ExternalLink size={20} color={Colors.primary} />
                <Text style={styles.linkText} numberOfLines={1}>External Portfolio</Text>
                <ExternalLink size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
        </View>
        <ReviewsComponent 
          reviews={[]} 
          averageRating={consultant.rating} 
          totalReviews={consultant.reviewCount} 
        />
      </ScrollView>

      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        shareContent={{
          title: `Check out ${consultant.name}'s profile`,
          message: `${consultant.name}${consultant.title ? ` - ${consultant.title}` : ''}${consultant.bio ? `\n${consultant.bio}` : ''}\n\nConnect with them!`,
        }}
        type="profile"
      />

      <View style={styles.bottomActions}>
        {currentUser?.id !== consultant.id && (
          <TouchableOpacity 
            style={[styles.followActionButton, isFollowing(consultant.id) && styles.followingActionButton]} 
            onPress={() => {
              if (isFollowing(consultant.id)) {
                unfollowUser(consultant.id);
              } else {
                followUser(consultant.id);
              }
            }}
          >
            {isFollowing(consultant.id) ? (
              <UserMinus size={20} color={Colors.textSecondary} />
            ) : (
              <UserPlus size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        )}
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
          <Text style={styles.bookButtonText}>Book</Text>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
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
  tierContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  tierBadgeWrapper: {
    paddingVertical: 4,
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
    paddingHorizontal: 16,
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
  followActionButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingActionButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
});
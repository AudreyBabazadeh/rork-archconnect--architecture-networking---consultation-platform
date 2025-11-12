import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, MapPin, MessageCircle, Calendar, UserPlus, UserMinus, Share2, ExternalLink, Linkedin, Globe, Instagram, Award, Briefcase, GraduationCap } from 'lucide-react-native';
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
import { LinearGradient } from 'expo-linear-gradient';

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

  const accentColor = Colors.primary;
  const coverImage = 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=400&fit=crop';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: coverImage }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.coverGradient}
          />
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroButton} onPress={() => router.back()}>
              <Share2 size={20} color={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroButton} onPress={handleShare}>
              <Share2 size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: consultant.avatar }} 
              style={styles.avatar} 
            />
            <View style={[styles.avatarBorder, { borderColor: accentColor }]} />
          </View>
        </View>

        <View style={styles.profileInfoCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{consultant.name}</Text>
            {consultant.loyaltyBadge && (
              <LoyaltyBadge badge={consultant.loyaltyBadge} size={18} />
            )}
          </View>
          {consultant.title && <Text style={styles.userTitle}>{consultant.title}</Text>}
          
          <View style={styles.metaInfoRow}>
            {consultant.university && (
              <View style={styles.metaItem}>
                <GraduationCap size={16} color={accentColor} />
                <Text style={styles.metaText}>{consultant.university}</Text>
              </View>
            )}
            {consultant.location && (
              <View style={styles.metaItem}>
                <MapPin size={16} color={accentColor} />
                <Text style={styles.metaText}>{consultant.location}</Text>
              </View>
            )}
          </View>

          {consultant.bio && (
            <Text style={styles.bio}>{consultant.bio}</Text>
          )}

          <View style={styles.statusRow}>
            {consultant.pricingTier && (
              <View style={styles.tierBadgeContainer}>
                <PricingTierBadge tier={consultant.pricingTier} size={10} />
                <Text style={styles.tierLabel}>{consultant.pricingTier}</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: consultant.isAvailable ? Colors.success : Colors.textLight }]}>
              <Text style={styles.statusText}>
                {consultant.isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.ratingRow}>
                <Star size={18} color={Colors.secondary} fill={Colors.secondary} />
                <Text style={[styles.statNumber, { color: accentColor }]}>{consultant.rating}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDividerVertical} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: accentColor }]}>{consultant.reviewCount}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDividerVertical} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: accentColor }]}>{consultant.experience}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {consultant.specialties && consultant.specialties.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Award size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Expertise & Skills</Text>
            </View>
            <View style={styles.specialties}>
              {consultant.specialties.map((specialty: string) => (
                <View key={specialty} style={[styles.specialtyTag, { borderColor: accentColor + '30' }]}>
                  <Text style={[styles.specialtyText, { color: accentColor }]}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {allImages.length > 0 && (
          <View style={styles.portfolioSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Briefcase size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Featured Work</Text>
            </View>
            <PortfolioGallery
              images={allImages.map((image: string, index: number) => ({
                id: `portfolio-image-${index}`,
                uri: image,
                caption: consultant.portfolio[Math.floor(index / consultant.portfolio[0]?.images?.length || 1)]?.title || '',
              }))}
              accentColor={accentColor}
              layout="grid"
            />
          </View>
        )}

        {(consultant.linkedIn || consultant.website || consultant.instagram || consultant.externalPortfolio) && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Globe size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Connect</Text>
            </View>
            <View style={styles.linksGrid}>
              {consultant.linkedIn && (
                <TouchableOpacity 
                  style={[styles.linkButton, { borderColor: accentColor + '30' }]}
                  onPress={() => openLink(consultant.linkedIn, 'LinkedIn')}
                  activeOpacity={0.7}
                >
                  <Linkedin size={20} color={accentColor} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>LinkedIn</Text>
                </TouchableOpacity>
              )}
              {consultant.website && (
                <TouchableOpacity 
                  style={[styles.linkButton, { borderColor: accentColor + '30' }]}
                  onPress={() => openLink(consultant.website, 'Website')}
                  activeOpacity={0.7}
                >
                  <Globe size={20} color={accentColor} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>Website</Text>
                </TouchableOpacity>
              )}
              {consultant.instagram && (
                <TouchableOpacity 
                  style={[styles.linkButton, { borderColor: accentColor + '30' }]}
                  onPress={() => openLink(consultant.instagram, 'Instagram')}
                  activeOpacity={0.7}
                >
                  <Instagram size={20} color={accentColor} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>Instagram</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
              <Star size={20} color={accentColor} />
            </View>
            <Text style={styles.sectionTitle}>Reviews</Text>
          </View>
          <ReviewsComponent 
            reviews={[]} 
            averageRating={consultant.rating} 
            totalReviews={consultant.reviewCount} 
          />
        </View>

        <View style={{ height: 100 }} />
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
    backgroundColor: '#F5F5F7',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
    height: 200,
    backgroundColor: Colors.border,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroActions: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  heroButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeaderSection: {
    backgroundColor: Colors.white,
    paddingBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: -60,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: Colors.white,
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    opacity: 0.3,
  },
  profileInfoCard: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24,
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  userTitle: {
    fontSize: 17,
    color: Colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bio: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tierBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDividerVertical: {
    width: 1,
    height: 48,
    backgroundColor: Colors.border,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specialtyTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  portfolioSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: Colors.white,
    minWidth: '30%',
  },
  linkButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
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
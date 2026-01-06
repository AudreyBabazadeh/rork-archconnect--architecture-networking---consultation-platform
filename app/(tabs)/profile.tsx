import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Edit3, Star, MapPin, Briefcase, GraduationCap, LogOut, Award, Share as ShareIcon, Linkedin, Globe, Instagram, MessageCircle, Sparkles, Clock, CheckCircle, ArrowRight, ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ReviewsComponent } from '@/components/ReviewsComponent';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/contexts/FollowContext';
import { ShareModal } from '@/components/ShareModal';
import { LinearGradient } from 'expo-linear-gradient';
import { PortfolioGallery } from '@/components/PortfolioGallery';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { getFollowingCount, getFollowerCount } = useFollow();
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/welcome');
          }
        }
      ]
    );
  };

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const handleChangeCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfile({ coverImage: result.assets[0].uri });
        Alert.alert('Success', 'Cover image updated successfully!');
      }
    } catch (error) {
      console.error('Error picking cover image:', error);
      Alert.alert('Error', 'Failed to update cover image. Please try again.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const accentColor = (user as any).accentColor || Colors.primary;
  const coverImage = (user as any).coverImage || 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=400&fit=crop';

  return (
    <SafeAreaView style={styles.container}>
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        shareContent={{
          title: `Check out ${user.name}'s profile`,
          message: `${user.name}${user.occupation ? ` - ${user.occupation}` : ''}${user.bio ? `\n${user.bio}` : ''}\n\nConnect with them!`,
        }}
        type="profile"
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
            <TouchableOpacity style={styles.heroButton} onPress={handleChangeCoverImage}>
              <ImageIcon size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroButton} onPress={handleShare}>
              <ShareIcon size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroButton} onPress={handleSignOut}>
              <LogOut size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }} 
              style={styles.avatar} 
            />
            <View style={[styles.avatarBorder, { borderColor: accentColor }]} />
          </View>
          
          <TouchableOpacity 
            style={[styles.editFloatingButton, { backgroundColor: accentColor }]}
            onPress={() => router.push('/profile/edit')}
            testID="edit-profile-button"
          >
            <Edit3 size={18} color={Colors.white} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfoCard}>
          <Text style={styles.name}>{user.name}</Text>
          {user.occupation && <Text style={styles.userTitle}>{user.occupation}</Text>}
          
          <View style={styles.metaInfoRow}>
            {user.university && (
              <View style={styles.metaItem}>
                <GraduationCap size={16} color={accentColor} />
                <Text style={styles.metaText}>{user.university}</Text>
              </View>
            )}
            {user.location && (
              <View style={styles.metaItem}>
                <MapPin size={16} color={accentColor} />
                <Text style={styles.metaText}>{user.location}</Text>
              </View>
            )}
          </View>

          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        {user.specialties && user.specialties.length > 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Award size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Expertise & Skills</Text>
            </View>
            <View style={styles.specialties}>
              {user.specialties.map((specialty) => (
                <View key={specialty} style={[styles.specialtyTag, { borderColor: accentColor + '30' }]}>
                  <Text style={[styles.specialtyText, { color: accentColor }]}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Award size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Expertise & Skills</Text>
            </View>
            <Text style={styles.emptyStateText}>
              Add your areas of expertise to help others understand{"\n"}
              what you specialize in and what you can offer.
            </Text>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: accentColor }]}
              onPress={() => router.push('/profile/edit')}
            >
              <Text style={styles.emptyStateButtonText}>Add Expertise</Text>
            </TouchableOpacity>
          </View>
        )}

        {(user as any).portfolioImages && (user as any).portfolioImages.length > 0 ? (
          <View style={styles.portfolioSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Briefcase size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Featured Work</Text>
            </View>
            <PortfolioGallery 
              images={(user as any).portfolioImages}
              accentColor={accentColor}
              layout="grid"
            />
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Briefcase size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Featured Work</Text>
            </View>
            <Text style={styles.emptyStateText}>
              Showcase your best projects and let your work speak for itself.{"\n"}
              Upload images of designs, models, or completed projects.
            </Text>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: accentColor }]}
              onPress={() => router.push('/profile/edit')}
            >
              <Text style={styles.emptyStateButtonText}>Add Portfolio</Text>
            </TouchableOpacity>
          </View>
        )}

        {user.mentorStatus === 'not_applied' && (
          <View style={styles.mentorInvitationCard}>
            <View style={styles.mentorInvitationHeader}>
              <View style={styles.mentorInvitationIconContainer}>
                <Sparkles size={32} color={Colors.secondary} strokeWidth={1.5} />
              </View>
              <View style={styles.mentorInvitationBadge}>
                <Text style={styles.mentorInvitationBadgeText}>Invitation Only</Text>
              </View>
            </View>
            
            <Text style={styles.mentorInvitationTitle}>Share Your Expertise</Text>
            <Text style={styles.mentorInvitationDescription}>
              Join Archal&apos;s curated network of mentors. Guide students and professionals through their professional journey while building your reputation in the community.
            </Text>

            <View style={styles.mentorBenefitsList}>
              <View style={styles.mentorBenefitItem}>
                <CheckCircle size={18} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.mentorBenefitText}>Set your own rates and schedule</Text>
              </View>
              <View style={styles.mentorBenefitItem}>
                <CheckCircle size={18} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.mentorBenefitText}>Build your professional network</Text>
              </View>
              <View style={styles.mentorBenefitItem}>
                <CheckCircle size={18} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.mentorBenefitText}>Get recognized as an expert</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.mentorApplyButton}
              onPress={() => router.push('/mentor/apply' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.mentorApplyButtonText}>Apply to Become a Mentor</Text>
              <ArrowRight size={20} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}

        {user.mentorStatus === 'pending' && (
          <View style={styles.mentorStatusCard}>
            <View style={styles.mentorStatusHeader}>
              <View style={styles.mentorStatusIconContainer}>
                <Clock size={28} color={accentColor} strokeWidth={1.5} />
              </View>
              <View style={styles.mentorStatusBadge}>
                <View style={styles.mentorStatusDot} />
                <Text style={styles.mentorStatusBadgeText}>Under Review</Text>
              </View>
            </View>
            
            <Text style={styles.mentorStatusTitle}>Application in Progress</Text>
            <Text style={styles.mentorStatusDescription}>
              Your mentor application is being carefully reviewed by our team. We&apos;re evaluating your profile, experience, and alignment with Archal&apos;s mentorship standards.
            </Text>

            <View style={styles.mentorTimelineInfo}>
              <Text style={styles.mentorTimelineText}>
                Most applications are reviewed within <Text style={styles.mentorTimelineHighlight}>3-5 business days</Text>
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.mentorStatusButton}
              onPress={() => router.push('/mentor/pending' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.mentorStatusButtonText}>View Application Status</Text>
              <ArrowRight size={18} color={accentColor} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}

        {user.mentorStatus === 'approved' && user.mentorLevel && (
          <View style={styles.mentorApprovedCard}>
            <View style={styles.mentorApprovedHeader}>
              <View style={styles.mentorApprovedIconContainer}>
                <Award size={28} color={Colors.secondary} strokeWidth={1.5} />
              </View>
              <View style={styles.mentorApprovedBadge}>
                <Text style={styles.mentorApprovedBadgeText}>Active Mentor</Text>
              </View>
            </View>
            
            <Text style={styles.mentorApprovedTitle}>
              {user.mentorLevel.charAt(0).toUpperCase() + user.mentorLevel.slice(1)} Mentor
            </Text>
            <Text style={styles.mentorApprovedDescription}>
              {user.mentorLevel === 'emerging' && 'Welcome to the mentor network. You\'re building your mentorship practice and making an impact.'}
              {user.mentorLevel === 'established' && 'You\'re an established mentor with proven experience. Students trust your guidance.'}
              {user.mentorLevel === 'expert' && 'You\'re recognized as an industry expert. Your mentorship is highly valued.'}
              {user.mentorLevel === 'master' && 'You\'re a distinguished professional and thought leader. Your expertise shapes the field.'}
            </Text>

            <View style={styles.mentorLevelIndicator}>
              <View style={styles.mentorLevelBar}>
                <View style={[
                  styles.mentorLevelProgress,
                  {
                    width: user.mentorLevel === 'emerging' ? '25%' :
                           user.mentorLevel === 'established' ? '50%' :
                           user.mentorLevel === 'expert' ? '75%' : '100%',
                    backgroundColor: Colors.secondary
                  }
                ]} />
              </View>
              <View style={styles.mentorLevelLabels}>
                <Text style={[styles.mentorLevelLabel, user.mentorLevel === 'emerging' && styles.mentorLevelLabelActive]}>Emerging</Text>
                <Text style={[styles.mentorLevelLabel, user.mentorLevel === 'established' && styles.mentorLevelLabelActive]}>Established</Text>
                <Text style={[styles.mentorLevelLabel, user.mentorLevel === 'expert' && styles.mentorLevelLabelActive]}>Expert</Text>
                <Text style={[styles.mentorLevelLabel, user.mentorLevel === 'master' && styles.mentorLevelLabelActive]}>Master</Text>
              </View>
            </View>
          </View>
        )}

        {((user as any).teachingFocus || (user as any).howITeach || (user as any).idealMentees) && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <GraduationCap size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Mentorship Philosophy</Text>
            </View>
            {(user as any).teachingFocus && (
              <View style={styles.approachSection}>
                <Text style={styles.approachTitle}>What I can help with</Text>
                <Text style={styles.approachText}>{(user as any).teachingFocus}</Text>
              </View>
            )}
            {(user as any).howITeach && (
              <View style={styles.approachSection}>
                <Text style={styles.approachTitle}>How I teach</Text>
                <Text style={styles.approachText}>{(user as any).howITeach}</Text>
              </View>
            )}
            {(user as any).idealMentees && (
              <View style={styles.approachSection}>
                <Text style={styles.approachTitle}>Looking for</Text>
                <Text style={styles.approachText}>{(user as any).idealMentees}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statBox}
              onPress={() => router.push('/profile/followers')}
              activeOpacity={0.7}
            >
              <Text style={[styles.statNumber, { color: accentColor }]}>{getFollowerCount()}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDividerVertical} />
            <TouchableOpacity 
              style={styles.statBox}
              onPress={() => router.push('/profile/following')}
              activeOpacity={0.7}
            >
              <Text style={[styles.statNumber, { color: accentColor }]}>{getFollowingCount()}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statDividerVertical} />
            <View style={styles.statBox}>
              <View style={styles.ratingRow}>
                <Star size={18} color={Colors.secondary} fill={Colors.secondary} />
                <Text style={[styles.statNumber, { color: accentColor }]}>{user.rating || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {(user as any).sessionTypes && (user as any).sessionTypes.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <MessageCircle size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Session Offerings</Text>
            </View>
            <View style={styles.sessionTypesContainer}>
              {(user as any).sessionTypes.map((type: string) => (
                <View key={type} style={[styles.sessionTypeTag, { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }]}>
                  <Text style={[styles.sessionTypeText, { color: accentColor }]}>{type}</Text>
                </View>
              ))}
            </View>
            <View style={styles.sessionDetailsRow}>
              {(user as any).preferredDuration && (
                <View style={styles.sessionDetail}>
                  <Text style={styles.sessionDetailLabel}>Duration</Text>
                  <Text style={styles.sessionDetailValue}>{(user as any).preferredDuration}</Text>
                </View>
              )}
              {(user as any).pricingTier && (
                <View style={styles.sessionDetail}>
                  <Text style={styles.sessionDetailLabel}>Pricing</Text>
                  <Text style={styles.sessionDetailValue}>{(user as any).pricingTier}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {((user as any).linkedIn || (user as any).website || (user as any).instagram || (user as any).externalPortfolio) && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Globe size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Connect</Text>
            </View>
            <View style={styles.linksGrid}>
              {(user as any).linkedIn && (
                <TouchableOpacity style={[styles.linkButton, { borderColor: accentColor + '30' }]}>
                  <Linkedin size={20} color={accentColor} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>LinkedIn</Text>
                </TouchableOpacity>
              )}
              {(user as any).website && (
                <TouchableOpacity style={[styles.linkButton, { borderColor: accentColor + '30' }]}>
                  <Globe size={20} color={accentColor} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>Website</Text>
                </TouchableOpacity>
              )}
              {(user as any).instagram && (
                <TouchableOpacity style={[styles.linkButton, { borderColor: accentColor + '30' }]}>
                  <Instagram size={20} color={accentColor} />
                  <Text style={styles.linkButtonText} numberOfLines={1}>Instagram</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {user.rating && user.rating > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
                <Star size={20} color={accentColor} />
              </View>
              <Text style={styles.sectionTitle}>Reviews</Text>
            </View>
            <ReviewsComponent 
              reviews={[]} 
              averageRating={user.rating} 
              totalReviews={(user as any).totalConsultations || 0} 
            />
          </View>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: accentColor + '20' }]}>
              <Award size={20} color={accentColor} />
            </View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: accentColor }]}
            onPress={() => router.push('/profile/edit')}
            testID="edit-profile-action"
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: accentColor + '15' }]}>
              <Edit3 size={22} color={accentColor} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionSubtitle}>Update your information and portfolio</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: accentColor }]}
            onPress={() => router.push('/profile/status')}
            testID="my-status-action"
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: accentColor + '15' }]}>
              <Award size={22} color={accentColor} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Status</Text>
              <Text style={styles.actionSubtitle}>View badge progress and platform fees</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { borderLeftColor: accentColor }]}
            onPress={() => router.push('/profile/availability')}
            testID="manage-availability-action"
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: accentColor + '15' }]}>
              <Briefcase size={22} color={accentColor} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Availability</Text>
              <Text style={styles.actionSubtitle}>Set your consultation hours and rates</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
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
    right: 16,
    flexDirection: 'row',
    gap: 12,
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
  editFloatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  profileInfoCard: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24,
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
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

  approachSection: {
    marginBottom: 20,
  },
  approachTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  approachText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sessionTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  sessionTypeTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  sessionTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sessionDetailsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sessionDetail: {
    flex: 1,
  },
  sessionDetailLabel: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  sessionDetailValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
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
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderLeftWidth: 4,
    backgroundColor: '#F9F9FB',
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
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
  emptyStateText: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  mentorInvitationCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: Colors.secondary + '20',
  },
  mentorInvitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mentorInvitationIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorInvitationBadge: {
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  mentorInvitationBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mentorInvitationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  mentorInvitationDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: 24,
  },
  mentorBenefitsList: {
    gap: 14,
    marginBottom: 28,
  },
  mentorBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mentorBenefitText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  mentorApplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mentorApplyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  mentorStatusCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.primary + '10',
  },
  mentorStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mentorStatusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mentorStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  mentorStatusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  mentorStatusTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  mentorStatusDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: 20,
  },
  mentorTimelineInfo: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  mentorTimelineText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  mentorTimelineHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  mentorStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  mentorStatusButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  mentorApprovedCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 28,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: Colors.secondary + '20',
  },
  mentorApprovedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mentorApprovedIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorApprovedBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mentorApprovedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mentorApprovedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  mentorApprovedDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: 24,
  },
  mentorLevelIndicator: {
    marginTop: 4,
  },
  mentorLevelBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mentorLevelProgress: {
    height: '100%',
    borderRadius: 4,
  },
  mentorLevelLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mentorLevelLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mentorLevelLabelActive: {
    color: Colors.secondary,
    fontWeight: '800',
  },
});
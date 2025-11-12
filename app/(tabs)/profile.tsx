import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Edit3, Star, MapPin, Briefcase, GraduationCap, LogOut, Award, Share as ShareIcon, Linkedin, Globe, Instagram } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/contexts/FollowContext';
import { ShareModal } from '@/components/ShareModal';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <ShareIcon size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleSignOut}>
                <LogOut size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }} style={styles.avatar} />
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/profile/edit')}
              testID="edit-profile-button"
            >
              <Edit3 size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          {user.occupation && <Text style={styles.userTitle}>{user.occupation}</Text>}
          
          {user.university && (
            <View style={styles.infoRow}>
              <GraduationCap size={16} color={Colors.textLight} />
              <Text style={styles.infoText}>{user.university}</Text>
            </View>
          )}
          
          {user.location && (
            <View style={styles.infoRow}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.infoText}>{user.location}</Text>
            </View>
          )}

          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        </View>

        {user.specialties && user.specialties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expertise & Skills</Text>
            <View style={styles.specialties}>
              {user.specialties.map((specialty) => (
                <View key={specialty} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(user as any).portfolioImages && (user as any).portfolioImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <View style={styles.portfolioGrid}>
              {(user as any).portfolioImages.map((img: any) => (
                <View key={img.id} style={styles.portfolioCard}>
                  <Image source={{ uri: img.uri }} style={styles.portfolioImageView} />
                  {img.caption && (
                    <Text style={styles.portfolioCaption}>{img.caption}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {((user as any).teachingFocus || (user as any).howITeach || (user as any).idealMentees) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mentorship Approach</Text>
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
                <Text style={styles.approachTitle}>Ideal mentees</Text>
                <Text style={styles.approachText}>{(user as any).idealMentees}</Text>
              </View>
            )}
          </View>
        )}

        {(user as any).sessionTypes && (user as any).sessionTypes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Preferences</Text>
            <View style={styles.sessionPreferences}>
              <Text style={styles.preferenceLabel}>Session Types:</Text>
              <View style={styles.sessionTypesContainer}>
                {(user as any).sessionTypes.map((type: string) => (
                  <View key={type} style={styles.sessionTypeTag}>
                    <Text style={styles.sessionTypeText}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>
            {(user as any).preferredDuration && (
              <View style={styles.sessionPreferences}>
                <Text style={styles.preferenceLabel}>Preferred Duration:</Text>
                <Text style={styles.preferenceValue}>{(user as any).preferredDuration}</Text>
              </View>
            )}
            {(user as any).pricingTier && (
              <View style={styles.sessionPreferences}>
                <Text style={styles.preferenceLabel}>Pricing Tier:</Text>
                <Text style={styles.preferenceValue}>{(user as any).pricingTier}</Text>
              </View>
            )}
          </View>
        )}

        {((user as any).linkedIn || (user as any).website || (user as any).instagram || (user as any).externalPortfolio) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect</Text>
            {(user as any).linkedIn && (
              <View style={styles.linkRow}>
                <Linkedin size={18} color={Colors.primary} />
                <Text style={styles.linkText}>{(user as any).linkedIn}</Text>
              </View>
            )}
            {(user as any).website && (
              <View style={styles.linkRow}>
                <Globe size={18} color={Colors.primary} />
                <Text style={styles.linkText}>{(user as any).website}</Text>
              </View>
            )}
            {(user as any).instagram && (
              <View style={styles.linkRow}>
                <Instagram size={18} color={Colors.primary} />
                <Text style={styles.linkText}>{(user as any).instagram}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => router.push('/profile/followers')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{getFollowerCount()}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => router.push('/profile/following')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{getFollowingCount()}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Star size={16} color={Colors.secondary} fill={Colors.secondary} />
              <Text style={styles.statNumber}>{user.rating || 0}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/profile/edit')}
            testID="edit-profile-action"
          >
            <View style={styles.actionIcon}>
              <Edit3 size={20} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionSubtitle}>Update your information and portfolio</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/profile/status')}
            testID="my-status-action"
          >
            <View style={styles.actionIcon}>
              <Award size={20} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Status</Text>
              <Text style={styles.actionSubtitle}>View badge progress and platform fees</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/profile/availability')}
            testID="manage-availability-action"
          >
            <View style={styles.actionIcon}>
              <Briefcase size={20} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Availability</Text>
              <Text style={styles.actionSubtitle}>Set your consultation hours and rates</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specialtyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  portfolioCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  portfolioImageView: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  portfolioCaption: {
    fontSize: 12,
    color: Colors.textSecondary,
    padding: 8,
  },
  approachSection: {
    marginBottom: 16,
  },
  approachTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  approachText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sessionPreferences: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  preferenceValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sessionTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sessionTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
  },
  sessionTypeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    flex: 1,
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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, MapPin, UserPlus, UserMinus } from 'lucide-react-native';
import { User } from '@/types/user';
import { Colors } from '@/constants/colors';
import { LoyaltyBadge } from './LoyaltyBadge';
import { useFollow } from '@/contexts/FollowContext';
import { useAuth } from '@/contexts/AuthContext';

interface UserCardProps {
  user: User;
  onPress: () => void;
}

export function UserCard({ user, onPress }: UserCardProps) {
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser?.id === user.id;
  const following = isFollowing(user.id);

  const handleFollowToggle = (e: any) => {
    e.stopPropagation();
    if (following) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.loyaltyBadge && (
              <LoyaltyBadge badge={user.loyaltyBadge} size={16} />
            )}
          </View>
          <Text style={styles.title}>{user.title}</Text>
          {user.university && (
            <Text style={styles.university}>{user.university}</Text>
          )}
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.textLight} />
            <Text style={styles.location}>{user.location}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${user.hourlyRate}</Text>
          <Text style={styles.priceLabel}>per hour</Text>
        </View>
      </View>

      <View style={styles.specialties}>
        {user.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {user.bio}
      </Text>

      <View style={styles.footer}>
        <View style={styles.rating}>
          <Star size={16} color={Colors.secondary} fill={Colors.secondary} />
          <Text style={styles.ratingText}>{user.rating}</Text>
          <Text style={styles.reviewCount}>({user.reviewCount} reviews)</Text>
        </View>
        <View style={styles.footerRight}>
          <View style={styles.availability}>
            <View style={[styles.statusDot, { backgroundColor: user.isAvailable ? Colors.success : Colors.textLight }]} />
            <Text style={styles.availabilityText}>
              {user.isAvailable ? 'Available' : 'Busy'}
            </Text>
          </View>
          {!isCurrentUser && (
            <TouchableOpacity
              style={[styles.followButton, following && styles.followingButton]}
              onPress={handleFollowToggle}
              activeOpacity={0.7}
            >
              {following ? (
                <UserMinus size={16} color={Colors.textSecondary} />
              ) : (
                <UserPlus size={16} color={Colors.white} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  title: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  university: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: Colors.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textLight,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
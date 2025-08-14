import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { LoyaltyBadge as LoyaltyBadgeType } from '@/types/user';


interface LoyaltyBadgeProps {
  badge: LoyaltyBadgeType;
  size?: 'small' | 'medium';
}

export function LoyaltyBadge({ badge, size = 'small' }: LoyaltyBadgeProps) {


  const getStarColor = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return '#9CA3AF'; // Medium silver
      case 'gold':
        return '#F59E0B'; // Rich gold
      case 'platinum':
        return '#E5E7EB'; // Bright shiny silver (most prestigious)
      default:
        return '#9CA3AF';
    }
  };

  const isSmall = size === 'small';
  const starColor = getStarColor(badge);

  return (
    <View style={[
      styles.container,
      isSmall ? styles.smallContainer : styles.mediumContainer
    ]}>
      <Star 
        size={isSmall ? 16 : 20} 
        color={starColor} 
        fill={starColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallContainer: {
    width: 20,
    height: 20,
  },
  mediumContainer: {
    width: 24,
    height: 24,
  },
});
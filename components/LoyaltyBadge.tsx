import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import { LoyaltyBadge as LoyaltyBadgeType } from '@/types/user';


interface LoyaltyBadgeProps {
  badge: LoyaltyBadgeType;
  size?: 'small' | 'medium';
}

export function LoyaltyBadge({ badge, size = 'small' }: LoyaltyBadgeProps) {
  const getBadgeColor = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#B8B8FF';
      default:
        return '#C0C0C0';
    }
  };

  const getBadgeTextColor = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return '#666666';
      case 'gold':
        return '#B8860B';
      case 'platinum':
        return '#4A4AFF';
      default:
        return '#666666';
    }
  };

  const isSmall = size === 'small';
  const badgeColor = getBadgeColor(badge);
  const textColor = getBadgeTextColor(badge);

  return (
    <View style={[
      styles.container,
      { backgroundColor: badgeColor },
      isSmall ? styles.smallContainer : styles.mediumContainer
    ]}>
      <Award 
        size={isSmall ? 10 : 12} 
        color={textColor} 
        fill={textColor}
      />
      <Text style={[
        styles.text,
        { color: textColor },
        isSmall ? styles.smallText : styles.mediumText
      ]}>
        {badge.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  smallContainer: {
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  mediumContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '700',
  },
  smallText: {
    fontSize: 9,
  },
  mediumText: {
    fontSize: 11,
  },
});
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { LoyaltyBadge as LoyaltyBadgeType } from '@/types/user';

interface LoyaltyBadgeProps {
  badge: LoyaltyBadgeType;
  size?: number;
}

export function LoyaltyBadge({ badge, size = 16 }: LoyaltyBadgeProps) {
  const getGradientColors = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return {
          start: '#F8F8FF',
          middle: '#E6E6FA', 
          end: '#C0C0C0',
          shadow: '#A8A8A8'
        };
      case 'gold':
        return {
          start: '#FFF8DC',
          middle: '#FFD700',
          end: '#DAA520',
          shadow: '#B8860B'
        };
      default:
        return {
          start: '#F8F8FF',
          middle: '#E6E6FA',
          end: '#C0C0C0',
          shadow: '#A8A8A8'
        };
    }
  };

  const colors = getGradientColors(badge);
  const gradientId = `gradient-${badge}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.start} />
            <Stop offset="50%" stopColor={colors.middle} />
            <Stop offset="100%" stopColor={colors.end} />
          </LinearGradient>
        </Defs>
        {/* 8-pointed star */}
        <Path
          d="M12 2 L14.5 8.5 L21 9 L16.5 13.5 L18 21 L12 17.5 L6 21 L7.5 13.5 L3 9 L9.5 8.5 Z"
          fill={`url(#${gradientId})`}
          stroke={colors.shadow}
          strokeWidth="0.5"
        />
        {/* Inner highlight */}
        <Path
          d="M12 4 L13.8 9.2 L19 9.5 L15.5 13 L16.5 19 L12 16.2 L7.5 19 L8.5 13 L5 9.5 L10.2 9.2 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.3"
          strokeOpacity="0.4"
        />
        {/* Checkmark */}
        <Path
          d="M8.5 12l2.5 2.5 5-5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
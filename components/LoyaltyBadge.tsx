import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { LoyaltyBadge as LoyaltyBadgeType } from '@/types/user';

interface LoyaltyBadgeProps {
  badge: LoyaltyBadgeType;
  size?: number;
}

export function LoyaltyBadge({ badge, size = 24 }: LoyaltyBadgeProps) {
  const getGradientColors = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return {
          start: '#F5F5F5',
          middle: '#E8E8E8',
          end: '#C0C0C0',
          shadow: '#A0A0A0'
        };
      case 'gold':
        return {
          start: '#FFF4B3',
          middle: '#FFD700',
          end: '#DAA520',
          shadow: '#B8860B'
        };
      default:
        return {
          start: '#F5F5F5',
          middle: '#E8E8E8',
          end: '#C0C0C0',
          shadow: '#A0A0A0'
        };
    }
  };

  const colors = getGradientColors(badge);
  const gradientId = `gradient-${badge}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.start} />
          <Stop offset="40%" stopColor={colors.middle} />
          <Stop offset="80%" stopColor={colors.end} />
          <Stop offset="100%" stopColor={colors.shadow} />
        </LinearGradient>
      </Defs>
      
      {/* Filled star shape */}
      <Path
        d="M12 2 L14.09 8.26 L21 9 L16.5 13.14 L17.91 20.02 L12 16.77 L6.09 20.02 L7.5 13.14 L3 9 L9.91 8.26 Z"
        fill={`url(#${gradientId})`}
        stroke={colors.shadow}
        strokeWidth="0.5"
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
  );
}

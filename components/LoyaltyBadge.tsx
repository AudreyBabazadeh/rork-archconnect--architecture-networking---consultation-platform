import React from 'react';
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
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.start} />
          <Stop offset="30%" stopColor={colors.middle} />
          <Stop offset="70%" stopColor={colors.end} />
          <Stop offset="100%" stopColor={colors.shadow} />
        </LinearGradient>
      </Defs>
      {/* 8-pointed star outer shadow */}
      <Path
        d="M12 1.5 L15.2 7.8 L22.5 8.5 L17.5 13.2 L19 21.5 L12 17.8 L5 21.5 L6.5 13.2 L1.5 8.5 L8.8 7.8 Z"
        fill={colors.shadow}
        opacity="0.3"
      />
      {/* 8-pointed star main body */}
      <Path
        d="M12 2 L15 8 L22 8.7 L17 13 L18.5 21 L12 17.5 L5.5 21 L7 13 L2 8.7 L9 8 Z"
        fill={`url(#${gradientId})`}
      />
      {/* Inner star highlight */}
      <Path
        d="M12 4 L14 9 L19 9.5 L15.5 12.5 L16.5 18 L12 15.5 L7.5 18 L8.5 12.5 L5 9.5 L10 9 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="0.4"
        strokeOpacity="0.6"
      />
      {/* Checkmark */}
      <Path
        d="M8.5 12l2.5 2.5 5-5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

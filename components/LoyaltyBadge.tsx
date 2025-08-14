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
      {/* Octagram outer shadow */}
      <Path
        d="M12 1 L14.5 6.5 L20.5 6.5 L16 10.5 L17.5 16.5 L12 13 L6.5 16.5 L8 10.5 L3.5 6.5 L9.5 6.5 Z M12 3 L15.5 8.5 L21.5 8.5 L17 12.5 L18.5 18.5 L12 15 L5.5 18.5 L7 12.5 L2.5 8.5 L8.5 8.5 Z"
        fill={colors.shadow}
        opacity="0.3"
        fillRule="evenodd"
      />
      {/* Octagram main body */}
      <Path
        d="M12 1.5 L14.2 6.8 L20 6.8 L15.7 10.2 L17.2 16.2 L12 12.7 L6.8 16.2 L8.3 10.2 L4 6.8 L9.8 6.8 Z M12 3.5 L15.2 8.2 L20.5 8.2 L16.5 11.8 L17.8 17.8 L12 14.3 L6.2 17.8 L7.5 11.8 L3.5 8.2 L8.8 8.2 Z"
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
      />
      {/* Inner octagram highlight */}
      <Path
        d="M12 4 L13.5 8 L18 8 L14.5 11 L15.5 15.5 L12 13 L8.5 15.5 L9.5 11 L6 8 L10.5 8 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="0.3"
        strokeOpacity="0.7"
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

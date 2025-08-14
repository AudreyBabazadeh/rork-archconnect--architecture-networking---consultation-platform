import React from 'react';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Path, Filter, FeDropShadow } from 'react-native-svg';
import { LoyaltyBadge as LoyaltyBadgeType } from '@/types/user';

interface LoyaltyBadgeProps {
  badge: LoyaltyBadgeType;
  size?: number;
}

export function LoyaltyBadge({ badge, size = 32 }: LoyaltyBadgeProps) {
  const getGradientColors = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return {
          highlight: '#FFFFFF',
          start: '#F8F8FF',
          middle: '#E6E6FA',
          end: '#C0C0C0',
          shadow: '#808080',
          dark: '#696969'
        };
      case 'gold':
        return {
          highlight: '#FFFACD',
          start: '#FFD700',
          middle: '#FFA500',
          end: '#DAA520',
          shadow: '#B8860B',
          dark: '#8B6914'
        };
      default:
        return {
          highlight: '#FFFFFF',
          start: '#F8F8FF',
          middle: '#E6E6FA',
          end: '#C0C0C0',
          shadow: '#808080',
          dark: '#696969'
        };
    }
  };

  const colors = getGradientColors(badge);
  const mainGradientId = `main-gradient-${badge}`;
  const highlightGradientId = `highlight-gradient-${badge}`;
  const shadowFilterId = `shadow-filter-${badge}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        {/* Main metallic gradient */}
        <LinearGradient id={mainGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.start} />
          <Stop offset="25%" stopColor={colors.middle} />
          <Stop offset="50%" stopColor={colors.end} />
          <Stop offset="75%" stopColor={colors.shadow} />
          <Stop offset="100%" stopColor={colors.dark} />
        </LinearGradient>
        
        {/* Highlight gradient for metallic shine */}
        <RadialGradient id={highlightGradientId} cx="30%" cy="30%" r="40%">
          <Stop offset="0%" stopColor={colors.highlight} stopOpacity="0.8" />
          <Stop offset="50%" stopColor={colors.start} stopOpacity="0.4" />
          <Stop offset="100%" stopColor={colors.middle} stopOpacity="0.1" />
        </RadialGradient>
        
        {/* Drop shadow filter */}
        <Filter id={shadowFilterId}>
          <FeDropShadow dx="1" dy="2" stdDeviation="1" floodColor={colors.dark} floodOpacity="0.3" />
        </Filter>
      </Defs>
      
      {/* Main star shape with metallic gradient */}
      <Path
        d="M12 2 L14.09 8.26 L21 9 L16.5 13.14 L17.91 20.02 L12 16.77 L6.09 20.02 L7.5 13.14 L3 9 L9.91 8.26 Z"
        fill={`url(#${mainGradientId})`}
        stroke={colors.dark}
        strokeWidth="0.8"
        filter={`url(#${shadowFilterId})`}
      />
      
      {/* Metallic highlight overlay */}
      <Path
        d="M12 2 L14.09 8.26 L21 9 L16.5 13.14 L17.91 20.02 L12 16.77 L6.09 20.02 L7.5 13.14 L3 9 L9.91 8.26 Z"
        fill={`url(#${highlightGradientId})`}
      />
      
      {/* Checkmark */}
      <Path
        d="M8.5 12l2.5 2.5 5-5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

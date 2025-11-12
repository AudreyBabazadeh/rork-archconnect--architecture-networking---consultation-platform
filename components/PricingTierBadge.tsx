import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type PricingTier = 'Free' | 'Moderate' | 'Premium' | 'Enterprise';

interface PricingTierBadgeProps {
  tier: PricingTier;
  size?: number;
}

export function PricingTierBadge({ tier, size = 16 }: PricingTierBadgeProps) {
  const dotCount = getTierDotCount(tier);
  const color = getTierColor(tier);

  return (
    <View style={styles.container}>
      {Array.from({ length: dotCount }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

function getTierDotCount(tier: PricingTier): number {
  switch (tier) {
    case 'Free':
      return 0;
    case 'Moderate':
      return 1;
    case 'Premium':
      return 2;
    case 'Enterprise':
      return 3;
    default:
      return 1;
  }
}

function getTierColor(tier: PricingTier): string {
  switch (tier) {
    case 'Free':
      return Colors.success;
    case 'Moderate':
      return Colors.textLight;
    case 'Premium':
      return Colors.primary;
    case 'Enterprise':
      return Colors.secondary;
    default:
      return Colors.textLight;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    borderRadius: 8,
  },
});

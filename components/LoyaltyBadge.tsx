import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import { LoyaltyBadge as LoyaltyBadgeType } from '@/types/user';


interface LoyaltyBadgeProps {
  badge: LoyaltyBadgeType;
  size?: 'small' | 'medium';
}

export function LoyaltyBadge({ badge, size = 'small' }: LoyaltyBadgeProps) {


  const getBadgeColors = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return {
          background: '#C0C0C0',
          border: '#A8A8A8',
          icon: '#8E8E8E',
          text: '#FFFFFF'
        };
      case 'gold':
        return {
          background: '#FFD700',
          border: '#E6C200',
          icon: '#B8860B',
          text: '#FFFFFF'
        };
      case 'platinum':
        return {
          background: '#E8E8E8',
          border: '#D0D0D0',
          icon: '#B8B8B8',
          text: '#4A4A4A'
        };
      default:
        return {
          background: '#C0C0C0',
          border: '#A8A8A8',
          icon: '#8E8E8E',
          text: '#FFFFFF'
        };
    }
  };

  const getBadgeLetter = (badge: LoyaltyBadgeType) => {
    switch (badge) {
      case 'silver':
        return 'S';
      case 'gold':
        return 'G';
      case 'platinum':
        return 'P';
      default:
        return 'S';
    }
  };

  const isSmall = size === 'small';
  const colors = getBadgeColors(badge);
  const letter = getBadgeLetter(badge);

  return (
    <View style={[
      styles.container,
      isSmall ? styles.smallContainer : styles.mediumContainer,
      {
        backgroundColor: colors.background,
        borderColor: colors.border,
      }
    ]}>
      <Award 
        size={isSmall ? 10 : 12} 
        color={colors.icon} 
        fill={colors.icon}
        style={styles.icon}
      />
      <Text style={[
        styles.letter,
        isSmall ? styles.smallLetter : styles.mediumLetter,
        { color: colors.text }
      ]}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  smallContainer: {
    width: 24,
    height: 24,
  },
  mediumContainer: {
    width: 28,
    height: 28,
  },
  icon: {
    position: 'absolute',
    top: 2,
  },
  letter: {
    fontWeight: '700',
    position: 'absolute',
    bottom: 1,
  },
  smallLetter: {
    fontSize: 8,
  },
  mediumLetter: {
    fontSize: 9,
  },
});
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { X, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  consultationType: string;
}

interface ReviewDetailModalProps {
  visible: boolean;
  review: Review | null;
  onClose: () => void;
}

export function ReviewDetailModal({ visible, review, onClose }: ReviewDetailModalProps) {
  if (!review) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        color={index < rating ? Colors.secondary : Colors.border}
        fill={index < rating ? Colors.secondary : 'transparent'}
      />
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Details</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.reviewerSection}>
              <View style={styles.reviewerInfo}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {review.clientName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reviewerDetails}>
                  <Text style={styles.reviewerName}>{review.clientName}</Text>
                  <View style={styles.starsRow}>
                    {renderStars(review.rating)}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>

            <View style={styles.sessionTypeCard}>
              <Text style={styles.sessionTypeLabel}>Session Type</Text>
              <Text style={styles.sessionTypeValue}>{review.consultationType}</Text>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Review</Text>
              <Text style={styles.commentText}>{review.comment}</Text>
            </View>

            <View style={styles.ratingBreakdown}>
              <Text style={styles.breakdownTitle}>Overall Rating</Text>
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingNumber}>{review.rating}.0</Text>
                <Text style={styles.ratingOutOf}>out of 5</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeBottomButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBottomButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  reviewerSection: {
    marginBottom: 24,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewDate: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  sessionTypeCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sessionTypeLabel: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionTypeValue: {
    fontSize: 17,
    color: Colors.primary,
    fontWeight: '700',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  commentText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  ratingBreakdown: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingDisplay: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 56,
  },
  ratingOutOf: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  closeBottomButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 24,
    marginBottom: 24,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBottomButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { X, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useReview } from '@/contexts/ReviewContext';

interface AllReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  consultantId: string;
  consultantName: string;
}

export function AllReviewsModal({ visible, onClose, consultantId, consultantName }: AllReviewsModalProps) {
  const { getReviewsForConsultant, getAverageRating, getTotalReviews } = useReview();
  
  const reviews = getReviewsForConsultant(consultantId);
  const averageRating = getAverageRating(consultantId);
  const totalReviews = getTotalReviews(consultantId);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? Colors.secondary : Colors.border}
        fill={index < rating ? Colors.secondary : 'transparent'}
      />
    ));
  };

  const renderRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });

    return (
      <View style={styles.ratingDistribution}>
        {[5, 4, 3, 2, 1].map((stars) => (
          <View key={stars} style={styles.ratingRow}>
            <Text style={styles.ratingNumber}>{stars}</Text>
            <Star size={14} color={Colors.secondary} fill={Colors.secondary} />
            <View style={styles.ratingBar}>
              <View 
                style={[
                  styles.ratingBarFill, 
                  { width: reviews.length > 0 ? `${(distribution[stars - 1] / reviews.length) * 100}%` : '0%' }
                ]} 
              />
            </View>
            <Text style={styles.ratingCount}>{distribution[stars - 1]}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Reviews</Text>
            <Text style={styles.subtitle}>{consultantName}</Text>
          </View>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.overviewCard}>
            <View style={styles.ratingOverview}>
              <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
              <View style={styles.starsContainer}>
                {renderStars(Math.round(averageRating))}
              </View>
              <Text style={styles.totalReviews}>
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </Text>
            </View>
            {reviews.length > 0 && renderRatingDistribution()}
          </View>

          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>All Reviews</Text>
            {reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Star size={48} color={Colors.border} />
                <Text style={styles.emptyText}>No reviews yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to leave a review for {consultantName}
                </Text>
              </View>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.clientName}</Text>
                      <Text style={styles.consultationType}>{review.consultationType}</Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <View style={styles.reviewStars}>
                        {renderStars(review.rating)}
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(review.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    padding: 24,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ratingDistribution: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    width: 10,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },
  reviewsSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  consultationType: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  reviewComment: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

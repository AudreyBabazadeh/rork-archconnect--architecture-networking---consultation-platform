import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { ReviewDetailModal } from './ReviewDetailModal';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  consultationType: string;
}

interface ReviewsComponentProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const mockReviews: Review[] = [
  {
    id: '1',
    clientName: 'Alex M.',
    rating: 5,
    comment: 'Excellent guidance on my thesis project. Sarah provided detailed feedback and helped me refine my design approach.',
    date: '2 weeks ago',
    consultationType: 'Portfolio Review'
  },
  {
    id: '2',
    clientName: 'Jordan K.',
    rating: 5,
    comment: 'Very knowledgeable about sustainable design principles. The consultation was well worth the investment.',
    date: '1 month ago',
    consultationType: 'Project Consultation'
  },
  {
    id: '3',
    clientName: 'Sam L.',
    rating: 4,
    comment: 'Great insights into urban planning concepts. Would definitely book another session.',
    date: '2 months ago',
    consultationType: 'Career Advice'
  }
];

export function ReviewsComponent({ reviews = mockReviews, averageRating, totalReviews }: ReviewsComponentProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleReviewPress = (review: Review) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedReview(null), 300);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
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
            <Star size={12} color={Colors.secondary} fill={Colors.secondary} />
            <View style={styles.ratingBar}>
              <View 
                style={[
                  styles.ratingBarFill, 
                  { width: `${(distribution[stars - 1] / reviews.length) * 100}%` }
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.ratingOverview}>
          <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
          <View style={styles.starsContainer}>
            {renderStars(Math.round(averageRating))}
          </View>
          <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
        </View>
        {renderRatingDistribution()}
      </View>

      <ScrollView style={styles.reviewsList} showsVerticalScrollIndicator={false}>
        {reviews.map((review) => (
          <TouchableOpacity 
            key={review.id} 
            style={styles.reviewCard}
            onPress={() => handleReviewPress(review)}
            activeOpacity={0.7}
          >
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.clientName}</Text>
                <Text style={styles.consultationType}>{review.consultationType}</Text>
              </View>
              <View style={styles.reviewMeta}>
                <View style={styles.reviewStars}>
                  {renderStars(review.rating)}
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            </View>
            <Text style={styles.reviewComment} numberOfLines={3}>{review.comment}</Text>
            <Text style={styles.tapToReadMore}>Tap to read full review</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ReviewDetailModal
        visible={modalVisible}
        review={selectedReview}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ratingOverview: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 20,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ratingDistribution: {
    flex: 1,
    gap: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 8,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 16,
    textAlign: 'right',
  },
  reviewsList: {
    maxHeight: 300,
  },
  reviewCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    marginBottom: 2,
  },
  consultationType: {
    fontSize: 12,
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
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tapToReadMore: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
});
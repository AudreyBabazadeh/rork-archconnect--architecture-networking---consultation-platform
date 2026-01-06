import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useBooking } from './BookingContext';

export interface Review {
  id: string;
  consultantId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  consultationType: string;
  sessionId: string;
}

interface ReviewContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  getReviewsForConsultant: (consultantId: string) => Review[];
  canUserReview: (consultantId: string) => boolean;
  hasUserReviewedSession: (sessionId: string) => boolean;
  getAverageRating: (consultantId: string) => number;
  getTotalReviews: (consultantId: string) => number;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const { bookingRequests } = useBooking();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const stored = await AsyncStorage.getItem('reviews');
        if (stored && stored !== 'ok' && stored !== 'null') {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setReviews(parsed);
            }
          } catch (parseError) {
            console.error('Error parsing reviews, clearing storage:', parseError);
            await AsyncStorage.removeItem('reviews');
          }
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };
    
    loadReviews();
  }, []);

  useEffect(() => {
    if (reviews.length > 0 || reviews.length === 0) {
      const save = async () => {
        try {
          await AsyncStorage.setItem('reviews', JSON.stringify(reviews));
        } catch (error) {
          console.error('Error saving reviews:', error);
        }
      };
      save();
    }
  }, [reviews]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addReview = useCallback(async (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: generateId(),
      date: new Date().toISOString(),
    };

    setReviews(prev => [...prev, newReview]);
  }, []);

  const getReviewsForConsultant = useCallback((consultantId: string): Review[] => {
    return reviews.filter(review => review.consultantId === consultantId);
  }, [reviews]);

  const canUserReview = useCallback((consultantId: string): boolean => {
    if (!user) return false;
    
    const completedSessions = bookingRequests.filter(
      booking => 
        booking.status === 'accepted' &&
        booking.mentorId === consultantId &&
        booking.studentId === user.id &&
        new Date(`${booking.date}T${booking.time}`) < new Date()
    );

    return completedSessions.length > 0;
  }, [user, bookingRequests]);

  const hasUserReviewedSession = useCallback((sessionId: string): boolean => {
    if (!user) return false;
    
    return reviews.some(
      review => review.sessionId === sessionId && review.clientId === user.id
    );
  }, [user, reviews]);

  const getAverageRating = useCallback((consultantId: string): number => {
    const consultantReviews = getReviewsForConsultant(consultantId);
    if (consultantReviews.length === 0) return 0;
    
    const sum = consultantReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / consultantReviews.length;
  }, [getReviewsForConsultant]);

  const getTotalReviews = useCallback((consultantId: string): number => {
    return getReviewsForConsultant(consultantId).length;
  }, [getReviewsForConsultant]);

  const contextValue = useMemo(() => ({
    reviews,
    addReview,
    getReviewsForConsultant,
    canUserReview,
    hasUserReviewedSession,
    getAverageRating,
    getTotalReviews,
  }), [
    reviews,
    addReview,
    getReviewsForConsultant,
    canUserReview,
    hasUserReviewedSession,
    getAverageRating,
    getTotalReviews,
  ]);

  return (
    <ReviewContext.Provider value={contextValue}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
}

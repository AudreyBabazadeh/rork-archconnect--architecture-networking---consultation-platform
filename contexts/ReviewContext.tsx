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
        } else if (user) {
          const demoReviews: Review[] = [
            {
              id: 'demo1',
              consultantId: user.id,
              clientId: 'client1',
              clientName: 'Sarah Johnson',
              rating: 5,
              comment: 'Absolutely outstanding experience! The guidance I received was incredibly insightful and tailored to my specific needs. The session was well-structured, and I walked away with actionable strategies that I could implement immediately. Highly recommend!',
              date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              consultationType: '1-on-1 Consultation',
              sessionId: 'session1'
            },
            {
              id: 'demo2',
              consultantId: user.id,
              clientId: 'client2',
              clientName: 'Michael Chen',
              rating: 5,
              comment: 'One of the best mentorship sessions I\'ve ever had. Clear communication, expert knowledge, and genuine care for my success. The advice was practical and immediately applicable to my situation.',
              date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
              consultationType: 'Career Coaching',
              sessionId: 'session2'
            },
            {
              id: 'demo3',
              consultantId: user.id,
              clientId: 'client3',
              clientName: 'Emily Rodriguez',
              rating: 4,
              comment: 'Great session overall! Very knowledgeable and patient. The only reason for 4 stars instead of 5 is that I wish we had a bit more time to dive deeper into some topics, but what we covered was excellent.',
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              consultationType: 'Portfolio Review',
              sessionId: 'session3'
            },
            {
              id: 'demo4',
              consultantId: user.id,
              clientId: 'client4',
              clientName: 'David Kim',
              rating: 5,
              comment: 'Exceeded my expectations! The session was incredibly valuable and helped me gain clarity on my career path. The personalized feedback was exactly what I needed.',
              date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              consultationType: 'Strategy Session',
              sessionId: 'session4'
            },
            {
              id: 'demo5',
              consultantId: user.id,
              clientId: 'client5',
              clientName: 'Jessica Park',
              rating: 5,
              comment: 'Incredible mentor! Very supportive and provided actionable insights that made a real difference in my work. Would definitely book again.',
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              consultationType: '1-on-1 Consultation',
              sessionId: 'session5'
            },
            {
              id: 'demo6',
              consultantId: user.id,
              clientId: 'client6',
              clientName: 'Alex Thompson',
              rating: 4,
              comment: 'Really helpful session! Got some great advice on navigating my career transition. Looking forward to implementing these strategies.',
              date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
              consultationType: 'Career Coaching',
              sessionId: 'session6'
            },
          ];
          setReviews(demoReviews);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };
    
    loadReviews();
  }, [user]);

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

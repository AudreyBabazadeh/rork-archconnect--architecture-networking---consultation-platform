import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface BookingRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  studentName: string;
  topic: string;
  date: string;
  time: string;
  description?: string;
  amount: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_declined' | 'booking_confirmed' | 'general';
  title: string;
  message: string;
  userId: string;
  bookingRequestId?: string;
  isRead: boolean;
  createdAt: string;
}

interface BookingContextType {
  bookingRequests: BookingRequest[];
  notifications: Notification[];
  sendBookingRequest: (request: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  acceptBookingRequest: (requestId: string) => Promise<void>;
  declineBookingRequest: (requestId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotificationCount: () => number;
  clearAllNotifications: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const SAMPLE_ACCEPTED_BOOKING_ID = 'sample-accepted-booking-001';

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const [sampleDataAdded, setSampleDataAdded] = useState(false);

  // Add sample accepted booking for demonstration
  useEffect(() => {
    if (user && !sampleDataAdded) {
      setSampleDataAdded(true);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      const sampleBookings: BookingRequest[] = [
        {
          id: SAMPLE_ACCEPTED_BOOKING_ID,
          mentorId: user.id === '1' ? '2' : '1',
          mentorName: user.id === '1' ? 'Sarah Johnson' : user.name,
          studentId: user.id === '1' ? user.id : '2',
          studentName: user.id === '1' ? user.name : 'Sarah Johnson',
          topic: 'Technical Help',
          date: tomorrowStr,
          time: '10:00',
          description: 'Software and technical assistance',
          amount: 75,
          status: 'accepted',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sample-accepted-booking-002',
          mentorId: user.id === '1' ? '3' : '1',
          mentorName: user.id === '1' ? 'Michael Chen' : user.name,
          studentId: user.id === '1' ? user.id : '3',
          studentName: user.id === '1' ? user.name : 'Michael Chen',
          topic: 'Career Advice',
          date: nextWeekStr,
          time: '14:00',
          description: 'Professional development discussion',
          amount: 25,
          status: 'accepted',
          createdAt: new Date().toISOString(),
        },
      ];
      
      setBookingRequests(prev => {
        const hasExistingSample = prev.some(req => req.id === SAMPLE_ACCEPTED_BOOKING_ID);
        if (!hasExistingSample) {
          return [...prev, ...sampleBookings];
        }
        return prev;
      });
    }
  }, [user, sampleDataAdded]);

  // Load data from storage on mount
  useEffect(() => {
    const loadBookingRequests = async () => {
      try {
        const stored = await AsyncStorage.getItem('booking_requests');
        if (stored && stored !== 'ok' && stored !== 'null') {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setBookingRequests(parsed);
            }
          } catch (parseError) {
            console.error('Error parsing booking requests, clearing storage:', parseError);
            await AsyncStorage.removeItem('booking_requests');
          }
        }
      } catch (error) {
        console.error('Error loading booking requests:', error);
      }
    };

    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications');
        if (stored && stored !== 'ok' && stored !== 'null') {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setNotifications(parsed);
            }
          } catch (parseError) {
            console.error('Error parsing notifications, clearing storage:', parseError);
            await AsyncStorage.removeItem('notifications');
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    
    loadBookingRequests();
    loadNotifications();
  }, []);

  // Save booking requests to storage whenever they change (skip initial render)
  useEffect(() => {
    if (bookingRequests.length > 0 || bookingRequests.length === 0) {
      const save = async () => {
        try {
          await AsyncStorage.setItem('booking_requests', JSON.stringify(bookingRequests));
        } catch (error) {
          console.error('Error saving booking requests:', error);
        }
      };
      save();
    }
  }, [bookingRequests]);

  // Save notifications to storage whenever they change (skip initial render)
  useEffect(() => {
    if (notifications.length > 0 || notifications.length === 0) {
      const save = async () => {
        try {
          await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
        } catch (error) {
          console.error('Error saving notifications:', error);
        }
      };
      save();
    }
  }, [notifications]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const sendBookingRequest = useCallback(async (requestData: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: BookingRequest = {
      ...requestData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setBookingRequests(prev => [...prev, newRequest]);

    // Create notification for mentor
    const mentorNotification: Notification = {
      id: generateId(),
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${requestData.studentName} wants to book a session about "${requestData.topic}"`,
      userId: requestData.mentorId,
      bookingRequestId: newRequest.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [...prev, mentorNotification]);
  }, []);

  const acceptBookingRequest = useCallback(async (requestId: string) => {
    setBookingRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'accepted' as const }
          : request
      )
    );

    const request = bookingRequests.find(r => r.id === requestId);
    if (request) {
      // Create notification for student
      const studentNotification: Notification = {
        id: generateId(),
        type: 'booking_accepted',
        title: 'Booking Request Accepted!',
        message: `${request.mentorName} has accepted your booking request. You can now proceed with payment.`,
        userId: request.studentId,
        bookingRequestId: requestId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications(prev => [...prev, studentNotification]);
    }
  }, [bookingRequests]);

  const declineBookingRequest = useCallback(async (requestId: string) => {
    setBookingRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'declined' as const }
          : request
      )
    );

    const request = bookingRequests.find(r => r.id === requestId);
    if (request) {
      // Create notification for student
      const studentNotification: Notification = {
        id: generateId(),
        type: 'booking_declined',
        title: 'Booking Request Declined',
        message: `${request.mentorName} has declined your booking request. You can try booking with another mentor.`,
        userId: request.studentId,
        bookingRequestId: requestId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications(prev => [...prev, studentNotification]);
    }
  }, [bookingRequests]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const getUnreadNotificationCount = useCallback(() => {
    if (!user) return 0;
    return notifications.filter(n => n.userId === user.id && !n.isRead).length;
  }, [user, notifications]);

  const clearAllNotifications = useCallback(() => {
    if (!user) return;
    setNotifications(prev => 
      prev.map(notification => 
        notification.userId === user.id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, [user]);

  const contextValue = useMemo(() => ({
    bookingRequests,
    notifications,
    sendBookingRequest,
    acceptBookingRequest,
    declineBookingRequest,
    markNotificationAsRead,
    getUnreadNotificationCount,
    clearAllNotifications,
  }), [
    bookingRequests,
    notifications,
    sendBookingRequest,
    acceptBookingRequest,
    declineBookingRequest,
    markNotificationAsRead,
    getUnreadNotificationCount,
    clearAllNotifications,
  ]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
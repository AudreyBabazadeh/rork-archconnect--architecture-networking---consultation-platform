import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

const STORAGE_KEY = 'messaging_data';

const mockConversations: Conversation[] = [
  {
    id: '1',
    participantId: '2',
    participantName: 'Dr. Sarah Chen',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    unreadCount: 2,
    messages: [
      {
        id: '1',
        senderId: '2',
        senderName: 'Dr. Sarah Chen',
        content: 'Hi! I saw your question about sustainable architecture. I\'d love to help you with your project.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
      },
      {
        id: '2',
        senderId: '2',
        senderName: 'Dr. Sarah Chen',
        content: 'Are you available for a consultation this week?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: false,
      },
    ],
    lastMessage: {
      id: '2',
      senderId: '2',
      senderName: 'Dr. Sarah Chen',
      content: 'Are you available for a consultation this week?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false,
    },
  },
  {
    id: '2',
    participantId: '3',
    participantName: 'Prof. Michael Torres',
    participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    unreadCount: 0,
    messages: [
      {
        id: '3',
        senderId: '1',
        senderName: 'You',
        content: 'Thank you for the feedback on my portfolio!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: true,
      },
      {
        id: '4',
        senderId: '3',
        senderName: 'Prof. Michael Torres',
        content: 'You\'re welcome! Keep up the great work.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true,
      },
    ],
    lastMessage: {
      id: '4',
      senderId: '3',
      senderName: 'Prof. Michael Torres',
      content: 'You\'re welcome! Keep up the great work.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
    },
  },
];

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          lastMessage: {
            ...conv.lastMessage,
            timestamp: new Date(conv.lastMessage.timestamp),
          },
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setConversations(conversationsWithDates);
      } else {
        // First time, use mock data
        setConversations(mockConversations);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockConversations));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations(mockConversations);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversations = async (newConversations: Conversation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: '1', // Current user ID
      senderName: 'You',
      content,
      timestamp: new Date(),
      isRead: true,
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: newMessage,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    await saveConversations(updatedConversations);
  };

  const markAsRead = async (conversationId: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, isRead: true })),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    await saveConversations(updatedConversations);
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  const getOrCreateConversation = async (
    participantId: string,
    participantName: string,
    participantAvatar?: string
  ): Promise<string> => {
    // Check if conversation already exists
    const existingConv = conversations.find(
      conv => conv.participantId === participantId
    );

    if (existingConv) {
      return existingConv.id;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participantId,
      participantName,
      participantAvatar,
      unreadCount: 0,
      messages: [],
      lastMessage: {
        id: 'initial',
        senderId: '1',
        senderName: 'You',
        content: '',
        timestamp: new Date(),
        isRead: true,
      },
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    await saveConversations(updatedConversations);

    return newConversation.id;
  };

  return {
    conversations,
    isLoading,
    sendMessage,
    markAsRead,
    getTotalUnreadCount,
    getOrCreateConversation,
  };
});
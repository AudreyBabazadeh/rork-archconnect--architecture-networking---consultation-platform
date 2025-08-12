import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Message, Conversation, User } from '@/types/user';
import { AppState } from 'react-native';

interface MessagingState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  isLoading: boolean;
}

interface MessagingActions {
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'image') => Promise<void>;
  createConversation: (participantId: string, participantName: string, participantAvatar: string) => Promise<string>;
  getOrCreateConversation: (participantId: string, participantName: string, participantAvatar: string) => Promise<string>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  startLiveSync: () => void;
  stopLiveSync: () => void;
  syncMessages: () => Promise<void>;
}

const CONVERSATIONS_STORAGE_KEY = 'app_conversations';
const MESSAGES_STORAGE_KEY = 'app_messages';


export const [MessagingProvider, useMessaging] = createContextHook((): MessagingState & MessagingActions => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);

  const loadConversations = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Load conversations from local storage
      const storedConversations = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      const localConversations: Conversation[] = storedConversations ? JSON.parse(storedConversations) : [];
      const userConversations = localConversations
        .filter(conv => conv.participants.includes(currentUser.id))
        .map(conv => ({
          ...conv,
          createdAt: typeof conv.createdAt === 'string' ? new Date(conv.createdAt) : conv.createdAt,
          updatedAt: typeof conv.updatedAt === 'string' ? new Date(conv.updatedAt) : conv.updatedAt,
          lastMessage: conv.lastMessage ? {
            ...conv.lastMessage,
            timestamp: typeof conv.lastMessage.timestamp === 'string' ? new Date(conv.lastMessage.timestamp) : conv.lastMessage.timestamp
          } : undefined
        }));
      setConversations(userConversations);
      console.log('Loaded conversations from local storage:', userConversations.length);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      // Load messages from local storage
      const storedMessages = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      const allMessages: { [key: string]: Message[] } = storedMessages ? JSON.parse(storedMessages) : {};
      const localMessages = (allMessages[conversationId] || []).map(msg => ({
        ...msg,
        timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
      }));
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: localMessages
      }));
      console.log(`Loaded ${localMessages.length} messages from local storage for conversation ${conversationId}`);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const createConversation = useCallback(async (participantId: string, participantName: string, participantAvatar: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const localConversation: Conversation = {
        id: conversationId,
        participants: [currentUser.id, participantId],
        participantNames: {
          [currentUser.id]: currentUser.name,
          [participantId]: participantName
        },
        participantAvatars: {
          [currentUser.id]: currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          [participantId]: participantAvatar
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const storedConversations = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      const allConversations: Conversation[] = storedConversations ? JSON.parse(storedConversations) : [];
      allConversations.push(localConversation);
      await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(allConversations));
      
      setConversations(prev => [...prev, localConversation]);
      console.log('Conversation created locally:', conversationId);
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, [currentUser]);

  const getOrCreateConversation = useCallback(async (participantId: string, participantName: string, participantAvatar: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(currentUser.id) && conv.participants.includes(participantId)
    );
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    return createConversation(participantId, participantName, participantAvatar);
  }, [currentUser, conversations, createConversation]);

  const sendMessage = useCallback(async (conversationId: string, content: string, type: 'text' | 'image' = 'text') => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newMessage: Message = {
        id: messageId,
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
        timestamp: new Date(),
        type,
        read: false
      };
      
      // Update local state immediately for better UX
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }));
      
      // Update local conversation state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      ));
      
      // Store message locally
      const storedMessages = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      const allMessages: { [key: string]: Message[] } = storedMessages ? JSON.parse(storedMessages) : {};
      
      if (!allMessages[conversationId]) {
        allMessages[conversationId] = [];
      }
      allMessages[conversationId].push(newMessage);
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
      
      // Update conversations storage
      const storedConversations = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      const allConversations: Conversation[] = storedConversations ? JSON.parse(storedConversations) : [];
      const updatedConversations = allConversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      );
      await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(updatedConversations));
      
      console.log('Message stored locally successfully');
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [currentUser]);

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!currentUser) return;
    
    try {
      const storedMessages = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      const allMessages: { [key: string]: Message[] } = storedMessages ? JSON.parse(storedMessages) : {};
      
      if (allMessages[conversationId]) {
        // Mark messages as read for current user
        allMessages[conversationId] = allMessages[conversationId].map(msg => 
          msg.senderId !== currentUser.id ? { ...msg, read: true } : msg
        );
        
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: allMessages[conversationId]
        }));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [currentUser]);

  const setCurrentUserCallback = useCallback((user: User | null) => {
    setCurrentUser(user);
  }, []);

  // Periodic sync for local storage (simulating real-time updates)
  const setupPeriodicSync = useCallback(() => {
    if (!currentUser) return;
    
    // Clean up existing intervals
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];
    
    // Periodic sync every 5 seconds
    const syncInterval = setInterval(() => {
      loadConversations();
    }, 5000);
    
    intervalRefs.current.push(syncInterval);
    console.log('Periodic sync set up for local storage');
  }, [currentUser, loadConversations]);
  
  const syncMessages = useCallback(async () => {
    // Reload conversations and messages from local storage
    await loadConversations();
    console.log('Synced messages from local storage');
  }, [loadConversations]);

  const startLiveSync = useCallback(() => {
    setupPeriodicSync();
    console.log('Started periodic local sync');
  }, [setupPeriodicSync]);

  const stopLiveSync = useCallback(() => {
    // Clean up all intervals
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];
    console.log('Stopped periodic local sync');
  }, []);

  // Set up periodic sync when user changes
  useEffect(() => {
    if (currentUser) {
      setupPeriodicSync();
    }
    
    return () => {
      // Clean up intervals when component unmounts or user changes
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
    };
  }, [currentUser, setupPeriodicSync]);
  
  // Handle app state changes for periodic sync
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && currentUser) {
        setupPeriodicSync();
      } else {
        stopLiveSync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [currentUser, setupPeriodicSync, stopLiveSync]);

  return useMemo(() => ({
    conversations,
    messages,
    isLoading,
    sendMessage,
    createConversation,
    getOrCreateConversation,
    markMessagesAsRead,
    loadMessages,
    setCurrentUser: setCurrentUserCallback,
    startLiveSync,
    stopLiveSync,
    syncMessages
  }), [conversations, messages, isLoading, sendMessage, createConversation, getOrCreateConversation, markMessagesAsRead, loadMessages, setCurrentUserCallback, startLiveSync, stopLiveSync, syncMessages]);
});
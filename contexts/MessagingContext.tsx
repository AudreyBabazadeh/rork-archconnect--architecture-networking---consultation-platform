import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Message, Conversation, User } from '@/types/user';
import { AppState } from 'react-native';
import { db } from '@/constants/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

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
const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

export const [MessagingProvider, useMessaging] = createContextHook((): MessagingState & MessagingActions => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  const loadConversations = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Load conversations from Firestore
      const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
      const q = query(
        conversationsRef, 
        where('participants', 'array-contains', currentUser.id),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const firestoreConversations: Conversation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreConversations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date()
          } : undefined
        } as Conversation);
      });
      
      if (firestoreConversations.length > 0) {
        console.log('Loaded conversations from Firestore:', firestoreConversations.length);
        setConversations(firestoreConversations);
      } else {
        // Fallback to local storage
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
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      // Load messages from Firestore
      const messagesRef = collection(db, MESSAGES_COLLECTION);
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const firestoreMessages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firestoreMessages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Message);
      });
      
      if (firestoreMessages.length > 0) {
        console.log(`Loaded ${firestoreMessages.length} messages from Firestore for conversation ${conversationId}`);
        setMessages(prev => ({
          ...prev,
          [conversationId]: firestoreMessages
        }));
      } else {
        // Fallback to local storage
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
      }
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
      const newConversation = {
        participants: [currentUser.id, participantId],
        participantNames: {
          [currentUser.id]: currentUser.name,
          [participantId]: participantName
        },
        participantAvatars: {
          [currentUser.id]: currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          [participantId]: participantAvatar
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Create conversation in Firestore
      const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
      const docRef = await addDoc(conversationsRef, newConversation);
      const conversationId = docRef.id;
      
      console.log('Conversation created in Firestore:', conversationId);
      
      // Also store locally as backup
      const localConversation: Conversation = {
        id: conversationId,
        ...newConversation,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const storedConversations = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      const allConversations: Conversation[] = storedConversations ? JSON.parse(storedConversations) : [];
      allConversations.push(localConversation);
      await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(allConversations));
      
      setConversations(prev => [...prev, localConversation]);
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
      const messageData = {
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
        timestamp: serverTimestamp(),
        type,
        read: false
      };
      
      // Store message in Firestore
      const messagesRef = collection(db, MESSAGES_COLLECTION);
      const docRef = await addDoc(messagesRef, messageData);
      
      const newMessage: Message = {
        id: docRef.id,
        ...messageData,
        timestamp: new Date()
      };
      
      console.log('Message stored in Firestore successfully');
      
      // Update local state immediately for better UX
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }));
      
      // Update conversation's last message in Firestore
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        lastMessage: {
          id: docRef.id,
          content,
          senderId: currentUser.id,
          senderName: currentUser.name,
          timestamp: serverTimestamp(),
          type,
          read: false
        },
        updatedAt: serverTimestamp()
      });
      
      // Update local conversation state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      ));
      
      // Also store locally as backup
      const storedMessages = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      const allMessages: { [key: string]: Message[] } = storedMessages ? JSON.parse(storedMessages) : {};
      
      if (!allMessages[conversationId]) {
        allMessages[conversationId] = [];
      }
      allMessages[conversationId].push(newMessage);
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
      
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

  // Real-time sync using Firestore listeners
  const setupRealtimeListeners = useCallback(() => {
    if (!currentUser) return;
    
    // Clean up existing listeners
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    
    // Listen to conversations
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const conversationsQuery = query(
      conversationsRef,
      where('participants', 'array-contains', currentUser.id),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
      const updatedConversations: Conversation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        updatedConversations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate() || new Date()
          } : undefined
        } as Conversation);
      });
      
      console.log('Real-time conversations update:', updatedConversations.length);
      setConversations(updatedConversations);
    });
    
    unsubscribeRefs.current.push(unsubscribeConversations);
    
    // Listen to messages for all conversations
    conversations.forEach(conversation => {
      const messagesRef = collection(db, MESSAGES_COLLECTION);
      const messagesQuery = query(
        messagesRef,
        where('conversationId', '==', conversation.id),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const updatedMessages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          updatedMessages.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          } as Message);
        });
        
        setMessages(prev => ({
          ...prev,
          [conversation.id]: updatedMessages
        }));
      });
      
      unsubscribeRefs.current.push(unsubscribeMessages);
    });
    
    console.log('Real-time listeners set up for', conversations.length, 'conversations');
  }, [currentUser, conversations]);
  
  const syncMessages = useCallback(async () => {
    // This is now handled by real-time listeners
    console.log('Using real-time Firestore listeners for sync');
  }, []);

  const startLiveSync = useCallback(() => {
    setupRealtimeListeners();
    console.log('Started real-time Firestore sync');
  }, [setupRealtimeListeners]);

  const stopLiveSync = useCallback(() => {
    // Clean up all listeners
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    console.log('Stopped real-time Firestore sync');
  }, []);

  // Set up real-time listeners when user changes
  useEffect(() => {
    if (currentUser && conversations.length > 0) {
      setupRealtimeListeners();
    }
    
    return () => {
      // Clean up listeners when component unmounts or user changes
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      unsubscribeRefs.current = [];
    };
  }, [currentUser, conversations.length, setupRealtimeListeners]);
  
  // Handle app state changes for real-time sync
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && currentUser) {
        setupRealtimeListeners();
      } else {
        stopLiveSync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [currentUser, setupRealtimeListeners, stopLiveSync]);

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
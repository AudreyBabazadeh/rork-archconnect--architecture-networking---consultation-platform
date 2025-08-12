import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { MessageCircle, Wifi, WifiOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types/user';
import { router } from 'expo-router';

function formatTimestamp(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return dateObj.toLocaleDateString();
}

export default function MessagesScreen() {
  const { conversations, messages, syncMessages } = useMessaging();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(true);

  // Sync messages periodically
  useEffect(() => {
    const messagesSyncInterval = setInterval(async () => {
      try {
        await syncMessages();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(messagesSyncInterval);
  }, [syncMessages]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    if (!user) return null;
    
    const otherParticipantId = item.participants.find(id => id !== user.id);
    const otherParticipantName = otherParticipantId ? item.participantNames[otherParticipantId] : 'Unknown';
    const otherParticipantAvatar = otherParticipantId ? item.participantAvatars[otherParticipantId] : '';
    
    const conversationMessages = messages[item.id] || [];
    const hasUnreadMessages = conversationMessages.some(msg => 
      msg.senderId !== user.id && !msg.read
    );
    
    const lastMessage = item.lastMessage;
    const timestamp = lastMessage ? formatTimestamp(lastMessage.timestamp) : formatTimestamp(item.createdAt);
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem} 
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <Image source={{ uri: otherParticipantAvatar }} style={styles.avatar} />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.name}>{otherParticipantName}</Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>
          <Text 
            style={[styles.lastMessage, hasUnreadMessages && styles.unreadMessage]} 
            numberOfLines={2}
          >
            {lastMessage ? lastMessage.content : 'Start a conversation'}
          </Text>
        </View>
        {hasUnreadMessages && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Messages</Text>
          <View style={styles.connectionIndicator}>
            {isConnected ? (
              <Wifi size={16} color={Colors.success} />
            ) : (
              <WifiOff size={16} color={Colors.textLight} />
            )}
          </View>
        </View>
        <Text style={styles.subtitle}>Your consultation conversations</Text>
      </View>

      {conversations.length > 0 ? (
        <FlatList
          data={conversations.sort((a, b) => {
            const dateA = typeof a.updatedAt === 'string' ? new Date(a.updatedAt) : a.updatedAt;
            const dateB = typeof b.updatedAt === 'string' ? new Date(b.updatedAt) : b.updatedAt;
            return dateB.getTime() - dateA.getTime();
          })}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MessageCircle size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Find people to chat with by browsing profiles
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  connectionIndicator: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  consultationType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 6,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    marginTop: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
import React, { useState } from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users } from 'lucide-react-native';
import { useMessaging, Conversation } from '@/contexts/MessagingContext';
import { Colors } from '@/constants/colors';
import CreateGroupModal from '@/components/CreateGroupModal';
import { mockUsers } from '@/data/mockUsers';

export default function MessagesScreen() {
  const router = useRouter();
  const { conversations, isLoading, createGroupConversation } = useMessaging();
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleCreateGroup = async (groupName: string, participantIds: string[]) => {
    const conversationId = await createGroupConversation(
      groupName,
      participantIds,
      mockUsers.map((u) => ({ id: u.id, name: u.name, avatar: u.avatar }))
    );
    router.push(`/messages/${conversationId}` as any);
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const renderAvatar = () => {
      if (item.isGroup && item.participants) {
        const displayParticipants = item.participants.slice(0, 2);
        if (displayParticipants.length === 1) {
          return (
            <Image
              source={{
                uri:
                  displayParticipants[0].avatar ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              }}
              style={styles.avatar}
            />
          );
        }
        return (
          <View style={styles.groupAvatarContainer}>
            {displayParticipants.map((participant, index) => (
              <Image
                key={participant.id}
                source={{
                  uri:
                    participant.avatar ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                }}
                style={[
                  styles.groupAvatar,
                  index === 1 && styles.groupAvatarSecond,
                ]}
              />
            ))}
          </View>
        );
      }
      return (
        <Image
          source={{
            uri:
              item.participantAvatar ||
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          }}
          style={styles.avatar}
        />
      );
    };

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/messages/${item.id}` as any)}
      >
        <View style={styles.avatarContainer}>
          {renderAvatar()}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.nameContainer}>
              <Text style={styles.participantName}>
                {item.groupName || item.participantName}
              </Text>
              {item.isGroup && (
                <Users size={14} color={Colors.textLight} style={styles.groupIcon} />
              )}
            </View>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessage.timestamp)}
            </Text>
          </View>
          {item.isGroup && item.participants && (
            <Text style={styles.participantsList} numberOfLines={1}>
              {item.participants.map((p) => p.name).join(', ')}
            </Text>
          )}
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={2}
          >
            {item.lastMessage.content}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.newGroupButton}
            onPress={() => setShowCreateGroup(true)}
          >
            <Users size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.newGroupButton}
          onPress={() => setShowCreateGroup(true)}
        >
          <Users size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation with a mentor or consultant
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CreateGroupModal
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  newGroupButton: {
    padding: 8,
    marginRight: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupAvatarContainer: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  groupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  groupAvatarSecond: {
    bottom: 0,
    right: 0,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    marginLeft: 6,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 18,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: '500',
  },
  participantsList: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth, AuthUser } from '@/contexts/AuthContext';
import { useFollow } from '@/contexts/FollowContext';

export default function FollowersScreen() {
  const { getUserById } = useAuth();
  const { getFollowerList } = useFollow();
  const [followerUsers, setFollowerUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollowerUsers = async () => {
      const followerIds = getFollowerList();
      const users: AuthUser[] = [];
      
      for (const id of followerIds) {
        const user = await getUserById(id);
        if (user) {
          users.push(user);
        }
      }
      
      setFollowerUsers(users);
      setIsLoading(false);
    };

    loadFollowerUsers();
  }, []);

  const renderUser = ({ item }: { item: AuthUser }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => router.push(`/consultant/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.profileImage || item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
        {item.university && (
          <Text style={styles.university}>{item.university}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Followers', headerBackTitle: 'Back' }} />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : followerUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No followers yet</Text>
          </View>
        ) : (
          <FlatList
            data={followerUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  university: {
    fontSize: 13,
    color: Colors.primary,
  },
});

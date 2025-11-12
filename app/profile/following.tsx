import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth, AuthUser } from '@/contexts/AuthContext';
import { useFollow } from '@/contexts/FollowContext';

export default function FollowingScreen() {
  const { getUserById } = useAuth();
  const { followingIds } = useFollow();
  const [followingUsers, setFollowingUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollowingUsers = async () => {
      setIsLoading(true);
      const followingIdsArray = Array.from(followingIds);
      console.log('===== Following Debug =====');
      console.log('followingIds Set:', followingIds);
      console.log('followingIds Array:', followingIdsArray);
      console.log('followingIds length:', followingIdsArray.length);
      
      const users: AuthUser[] = [];
      
      for (const id of followingIdsArray) {
        console.log('Fetching user with ID:', id);
        const user = await getUserById(id);
        if (user) {
          console.log('Found user:', user.name);
          users.push(user);
        } else {
          console.log('User not found for ID:', id);
        }
      }
      
      console.log('Total loaded following users:', users.length);
      console.log('===========================');
      setFollowingUsers(users);
      setIsLoading(false);
    };

    loadFollowingUsers();
  }, [followingIds, getUserById]);

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
      <Stack.Screen options={{ title: 'Following', headerBackTitle: 'Back' }} />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : followingUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You are not following anyone yet</Text>
          </View>
        ) : (
          <FlatList
            data={followingUsers}
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

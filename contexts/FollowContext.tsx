import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

interface FollowRelation {
  followerId: string;
  followingId: string;
  timestamp: string;
}

interface FollowState {
  followingIds: Set<string>;
  followerIds: Set<string>;
  isLoading: boolean;
}

interface FollowActions {
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  getFollowingCount: () => number;
  getFollowerCount: () => number;
  getFollowingList: () => string[];
  getFollowerList: () => string[];
}

const FOLLOWS_STORAGE_KEY = 'app_follows';

export const [FollowProvider, useFollow] = createContextHook((): FollowState & FollowActions => {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followerIds, setFollowerIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollows = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const storedFollows = await AsyncStorage.getItem(FOLLOWS_STORAGE_KEY);
        let follows: FollowRelation[] = [];
        
        if (storedFollows && storedFollows !== 'null') {
          try {
            follows = JSON.parse(storedFollows);
          } catch {
            console.log('Error parsing follows, resetting...');
            await AsyncStorage.removeItem(FOLLOWS_STORAGE_KEY);
          }
        }

        const following = new Set(
          follows
            .filter(f => f.followerId === user.id)
            .map(f => f.followingId)
        );
        
        const followers = new Set(
          follows
            .filter(f => f.followingId === user.id)
            .map(f => f.followerId)
        );

        setFollowingIds(following);
        setFollowerIds(followers);
      } catch (error) {
        console.error('Error loading follows:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFollows();
  }, [user]);

  const followUser = useCallback(async (userId: string): Promise<void> => {
    if (!user || userId === user.id) return;

    try {
      const storedFollows = await AsyncStorage.getItem(FOLLOWS_STORAGE_KEY);
      let follows: FollowRelation[] = [];
      
      if (storedFollows && storedFollows !== 'null') {
        try {
          follows = JSON.parse(storedFollows);
        } catch {
          console.log('Error parsing follows');
        }
      }

      const existingFollow = follows.find(
        f => f.followerId === user.id && f.followingId === userId
      );

      if (!existingFollow) {
        const newFollow: FollowRelation = {
          followerId: user.id,
          followingId: userId,
          timestamp: new Date().toISOString(),
        };

        follows.push(newFollow);
        await AsyncStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(follows));

        setFollowingIds(prev => new Set([...prev, userId]));
        console.log('User followed successfully');
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [user]);

  const unfollowUser = useCallback(async (userId: string): Promise<void> => {
    if (!user) return;

    try {
      const storedFollows = await AsyncStorage.getItem(FOLLOWS_STORAGE_KEY);
      let follows: FollowRelation[] = [];
      
      if (storedFollows && storedFollows !== 'null') {
        try {
          follows = JSON.parse(storedFollows);
        } catch {
          console.log('Error parsing follows');
        }
      }

      const updatedFollows = follows.filter(
        f => !(f.followerId === user.id && f.followingId === userId)
      );

      await AsyncStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(updatedFollows));

      setFollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      console.log('User unfollowed successfully');
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }, [user]);

  const isFollowing = useCallback((userId: string): boolean => {
    return followingIds.has(userId);
  }, [followingIds]);

  const getFollowingCount = useCallback((): number => {
    return followingIds.size;
  }, [followingIds]);

  const getFollowerCount = useCallback((): number => {
    return followerIds.size;
  }, [followerIds]);

  const getFollowingList = useCallback((): string[] => {
    return Array.from(followingIds);
  }, [followingIds]);

  const getFollowerList = useCallback((): string[] => {
    return Array.from(followerIds);
  }, [followerIds]);

  return useMemo(() => ({
    followingIds,
    followerIds,
    isLoading,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowingCount,
    getFollowerCount,
    getFollowingList,
    getFollowerList,
  }), [
    followingIds,
    followerIds,
    isLoading,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowingCount,
    getFollowerCount,
    getFollowingList,
    getFollowerList,
  ]);
});

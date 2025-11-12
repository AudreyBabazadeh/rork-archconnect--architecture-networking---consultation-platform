import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from '@/types/user';

export interface AuthUser extends User {
  email: string;
  occupation?: string;
  university?: string;
  specialization?: string;
  profileImage?: string;
  createdAt: string;
  hasCompletedOnboarding?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: Partial<AuthUser> & { email: string; password: string; name: string; username: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  searchUsers: (query: string) => Promise<AuthUser[]>;
  getUserById: (id: string) => Promise<AuthUser | null>;
  completeOnboarding: () => Promise<void>;
}

const STORAGE_KEY = 'auth_user';
const USERS_STORAGE_KEY = 'app_users_local';

export const [AuthProvider, useAuth] = createContextHook((): AuthState & AuthActions => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUser && storedUser !== 'ok' && storedUser !== 'null') {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && typeof parsed === 'object') {
              setUser(parsed);
            }
          } catch (parseError) {
            console.error('Error parsing stored user, clearing storage:', parseError);
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStoredUser();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let users: AuthUser[] = [];
      if (storedUsers && storedUsers !== 'ok' && storedUsers !== 'null') {
        try {
          users = JSON.parse(storedUsers);
        } catch {
          console.log('Error parsing users, resetting...');
          await AsyncStorage.removeItem(USERS_STORAGE_KEY);
        }
      }
      
      const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        setUser(existingUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingUser));
        console.log('User signed in successfully:', existingUser.name);
        return true;
      }
      
      console.log('No user found with email:', email);
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (userData: Partial<AuthUser> & { email: string; password: string; name: string; username: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let users: AuthUser[] = [];
      if (storedUsers && storedUsers !== 'ok' && storedUsers !== 'null') {
        try {
          users = JSON.parse(storedUsers);
        } catch {
          console.log('Error parsing users, resetting...');
          await AsyncStorage.removeItem(USERS_STORAGE_KEY);
        }
      }
      
      const existingUser = users.find(u => u.email?.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const existingUsername = users.find(u => u.username?.toLowerCase() === userData.username.toLowerCase());
      if (existingUsername) {
        throw new Error('Username already taken');
      }
      
      // Generate unique ID
      const userId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser: AuthUser = {
        // Base User properties
        title: userData.occupation || '',
        avatar: userData.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        specialties: userData.specialization ? [userData.specialization] : [],
        reviewCount: 0,
        isAvailable: true,
        portfolio: [],
        // AuthUser specific properties
        id: userId,
        name: userData.name,
        username: userData.username,
        location: userData.location || '',
        experience: userData.experience || '',
        hourlyRate: userData.hourlyRate || 25,
        rating: 0,
        bio: userData.bio || '',
        email: userData.email,
        occupation: userData.occupation || '',
        university: userData.university || '',
        createdAt: new Date().toISOString(),
        hasCompletedOnboarding: false
      };
      
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      console.log('User created successfully:', newUser.name);
      
      setUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AuthUser>): Promise<void> => {
    try {
      if (!user) return;
      
      const processedUpdates = { ...updates };
      
      if ((updates as any).expertiseTags) {
        processedUpdates.specialties = (updates as any).expertiseTags;
      }
      
      const updatedUser = { ...user, ...processedUpdates };
      
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let users: AuthUser[] = [];
      if (storedUsers && storedUsers !== 'ok' && storedUsers !== 'null') {
        try {
          users = JSON.parse(storedUsers);
        } catch {
          console.log('Error parsing users, resetting...');
          await AsyncStorage.removeItem(USERS_STORAGE_KEY);
        }
      }
      
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  }, [user]);

  const searchUsers = useCallback(async (query: string): Promise<AuthUser[]> => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let users: AuthUser[] = [];
      if (storedUsers && storedUsers !== 'ok' && storedUsers !== 'null') {
        try {
          users = JSON.parse(storedUsers);
        } catch {
          console.log('Error parsing users, resetting...');
          await AsyncStorage.removeItem(USERS_STORAGE_KEY);
        }
      }
      
      const queryLower = query.toLowerCase();
      const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(queryLower) ||
        u.username?.toLowerCase().includes(queryLower) ||
        u.email?.toLowerCase().includes(queryLower) ||
        (u.university && u.university.toLowerCase().includes(queryLower)) ||
        (u.specialties && u.specialties.some(s => s?.toLowerCase().includes(queryLower)))
      );
      
      console.log(`Found ${filteredUsers.length} users matching "${query}"`);
      return filteredUsers;
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  }, []);
  
  const getUserById = useCallback(async (id: string): Promise<AuthUser | null> => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let users: AuthUser[] = [];
      if (storedUsers && storedUsers !== 'ok' && storedUsers !== 'null') {
        try {
          users = JSON.parse(storedUsers);
        } catch {
          console.log('Error parsing users, resetting...');
          await AsyncStorage.removeItem(USERS_STORAGE_KEY);
        }
      }
      
      let foundUser = users.find(u => u.id === id) || null;
      
      if (!foundUser) {
        const { mockUsers } = await import('@/data/mockUsers');
        const mockUser = mockUsers.find(u => u.id === id);
        if (mockUser) {
          foundUser = {
            ...mockUser,
            email: `${mockUser.username}@example.com`,
            occupation: mockUser.title,
            university: mockUser.university || '',
            specialization: mockUser.specialties?.[0] || '',
            profileImage: mockUser.avatar,
            createdAt: new Date().toISOString(),
          } as AuthUser;
          console.log('Found user in mockUsers:', foundUser.name);
        }
      }
      
      if (foundUser) {
        console.log('Found user:', foundUser.name);
      } else {
        console.log('User not found with ID:', id);
      }
      return foundUser;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }, []);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      let users: AuthUser[] = [];
      if (storedUsers && storedUsers !== 'ok' && storedUsers !== 'null') {
        try {
          users = JSON.parse(storedUsers);
        } catch {
          console.log('Error parsing users, resetting...');
          await AsyncStorage.removeItem(USERS_STORAGE_KEY);
        }
      }
      
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        console.log('Onboarding completed');
      }
    } catch (error) {
      console.error('Complete onboarding error:', error);
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedOnboarding: user?.hasCompletedOnboarding || false,
    signIn,
    signUp,
    signOut,
    updateProfile,
    searchUsers,
    getUserById,
    completeOnboarding
  }), [user, isLoading, signIn, signUp, signOut, updateProfile, searchUsers, getUserById, completeOnboarding]);
});
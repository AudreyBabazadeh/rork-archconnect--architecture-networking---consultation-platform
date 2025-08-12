import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserCard } from '@/components/UserCard';
import { SearchHeader } from '@/components/SearchHeader';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { mockUsers } from '@/data/mockUsers';
import { User } from '@/types/user';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';



export default function BrowseScreen() {
  const router = useRouter();
  const { user: currentUser, searchUsers } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    specialties: [],
    priceRange: [0, 200],
    experience: [],
    availability: null,
    rating: 0,
    userType: []
  });

  // Load real users from cloud and local storage
  useEffect(() => {
    const loadRealUsers = async () => {
      try {
        let users: any[] = [];
        
        // First try to search all users from cloud using the auth context
        if (currentUser && searchUsers) {
          try {
            const cloudUsers = await searchUsers(''); // Empty query to get all users
            users = cloudUsers.filter((u: any) => u.id !== currentUser.id); // Exclude current user
            console.log('Loaded users from cloud:', users.length);
          } catch (cloudError) {
            console.log('Cloud search failed, trying local storage');
          }
        }
        
        // Fallback to local storage if cloud search failed or no users found
        if (users.length === 0) {
          try {
            const localUsers = await AsyncStorage.getItem('app_users_local');
            if (localUsers) {
              const localUsersList = JSON.parse(localUsers);
              users = localUsersList.filter((u: any) => u.id !== currentUser?.id);
              console.log('Loaded users from local storage:', users.length);
            }
          } catch (storageError) {
            console.log('Local storage error:', storageError);
          }
        }
        
        if (users.length > 0) {
          // Convert auth users to display format
          const convertedUsers = users.map((u: any) => ({
            id: u.id,
            name: u.name,
            title: u.userType === 'professor' ? `Professor at ${u.university || 'University'}` : `${u.userType === 'student' ? 'Architecture Student' : 'Architecture Professional'}`,
            university: u.university,
            location: u.location || 'Location not specified',
            avatar: u.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            specialties: u.specialization ? [u.specialization] : ['General Architecture'],
            experience: u.experience || '1 year',
            hourlyRate: u.hourlyRate || 25,
            rating: u.rating || 4.5,
            reviewCount: u.totalConsultations || 0,
            bio: u.bio || 'Architecture professional ready to help with your projects.',
            isAvailable: true,
            portfolio: u.portfolio || []
          }));
          setRealUsers(convertedUsers);
        }
      } catch (error) {
        console.error('Error loading real users:', error);
      }
    };
    
    loadRealUsers();
  }, [currentUser, searchUsers]);

  const [cloudSearchResults, setCloudSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Perform cloud search when search query changes
  useEffect(() => {
    const performCloudSearch = async () => {
      if (!searchQuery.trim() || !searchUsers) {
        setCloudSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        const convertedResults = results
          .filter((u: any) => u.id !== currentUser?.id)
          .map((u: any) => ({
            id: u.id,
            name: u.name,
            title: u.userType === 'professor' ? `Professor at ${u.university || 'University'}` : `${u.userType === 'student' ? 'Architecture Student' : 'Architecture Professional'}`,
            university: u.university,
            location: u.location || 'Location not specified',
            avatar: u.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
            specialties: u.specialization ? [u.specialization] : ['General Architecture'],
            experience: u.experience || '1 year',
            hourlyRate: u.hourlyRate || 25,
            rating: u.rating || 4.5,
            reviewCount: u.totalConsultations || 0,
            bio: u.bio || 'Architecture professional ready to help with your projects.',
            isAvailable: true,
            portfolio: u.portfolio || []
          }));
        setCloudSearchResults(convertedResults);
        console.log(`Cloud search found ${convertedResults.length} users for query: ${searchQuery}`);
      } catch (error) {
        console.error('Cloud search error:', error);
        setCloudSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performCloudSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers, currentUser]);

  const filteredUsers = useMemo(() => {
    // Use cloud search results if searching, otherwise combine mock users with real users
    let result = searchQuery.trim() && cloudSearchResults.length > 0 
      ? cloudSearchResults 
      : [...mockUsers, ...realUsers];

    // Apply local search if no cloud results but there's a query
    if (searchQuery.trim() && cloudSearchResults.length === 0 && !isSearching) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.title.toLowerCase().includes(query) ||
        user.university?.toLowerCase().includes(query) ||
        user.specialties.some((specialty: string) => specialty.toLowerCase().includes(query)) ||
        user.location.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.specialties.length > 0) {
      result = result.filter(user => 
        user.specialties.some((specialty: string) => filters.specialties.includes(specialty))
      );
    }

    if (filters.availability !== null) {
      result = result.filter(user => user.isAvailable === filters.availability);
    }

    if (filters.rating > 0) {
      result = result.filter(user => user.rating >= filters.rating);
    }

    result = result.filter(user => 
      user.hourlyRate >= filters.priceRange[0] && user.hourlyRate <= filters.priceRange[1]
    );

    return result;
  }, [searchQuery, filters, realUsers, cloudSearchResults, isSearching]);

  const handleUserPress = (user: User) => {
    router.push(`/consultant/${user.id}`);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const renderUser = ({ item }: { item: User }) => (
    <UserCard user={item} onPress={() => handleUserPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <SearchHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterPress={handleFilterPress}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  listContent: {
    paddingBottom: 20,
  },
});
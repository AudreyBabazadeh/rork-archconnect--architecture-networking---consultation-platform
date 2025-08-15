import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, Users, BookOpen, MessageCircle } from 'lucide-react-native';
import { PostCard } from '@/components/PostCard';
import { mockPosts } from '@/data/mockPosts';
import { Post } from '@/types/user';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

type FilterType = 'all' | 'trending' | 'students' | 'mentors' | 'professors';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts];
    
    // Update liked status based on local state
    posts = posts.map(post => ({
      ...post,
      isLiked: likedPosts.has(post.id),
      likes: post.isLiked ? post.likes : (likedPosts.has(post.id) ? post.likes + 1 : post.likes)
    }));

    switch (activeFilter) {
      case 'trending':
        return posts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 10);
      case 'students':
        return posts.filter(post => post.authorType === 'student');
      case 'mentors':
        return posts.filter(post => post.authorType === 'mentor');
      case 'professors':
        return posts.filter(post => post.authorType === 'professor');
      default:
        return posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
  }, [activeFilter, likedPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail with comments
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    // Handle share functionality
    console.log('Share post:', postId);
  };

  const handleAuthorPress = (authorId: string) => {
    // Navigate to author profile
    router.push(`/consultant/${authorId}`);
  };



  const filters = [
    { key: 'all' as FilterType, label: 'All', icon: null },
    { key: 'trending' as FilterType, label: 'Trending', icon: TrendingUp },
    { key: 'students' as FilterType, label: 'Students', icon: Users },
    { key: 'mentors' as FilterType, label: 'Mentors', icon: BookOpen },
    { key: 'professors' as FilterType, label: 'Professors', icon: BookOpen },
  ];

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onAuthorPress={handleAuthorPress}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Architect'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.messagesButton}
          onPress={() => router.push('/messages')}
        >
          <MessageCircle size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const IconComponent = filter.icon;
          
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterButton, isActive && styles.activeFilterButton]}
              onPress={() => setActiveFilter(filter.key)}
            >
              {IconComponent && (
                <IconComponent 
                  size={16} 
                  color={isActive ? Colors.white : Colors.textLight} 
                  style={styles.filterIcon}
                />
              )}
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  header: {
    backgroundColor: Colors.white,
    paddingTop: 16,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },

  filtersContainer: {
    paddingLeft: 16,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  activeFilterText: {
    color: Colors.white,
  },
  separator: {
    height: 8,
    backgroundColor: Colors.surface,
  },
  messagesButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
});
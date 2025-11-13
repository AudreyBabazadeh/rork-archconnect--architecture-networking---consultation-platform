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
import { Users, HelpCircle, MessageCircle, UserCircle, ArrowRight, Globe } from 'lucide-react-native';
import { PostCard } from '@/components/PostCard';
import { mockPosts } from '@/data/mockPosts';
import { Post } from '@/types/user';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/contexts/FollowContext';
import { useMessaging } from '@/contexts/MessagingContext';

type FilterType = 'following' | 'explore' | 'ask';

export default function HomeScreen() {
  const router = useRouter();
  const { user, hasCompletedOnboarding } = useAuth();
  const { getTotalUnreadCount } = useMessaging();
  const { getFollowingList } = useFollow();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('following');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts];
    
    // Update liked status based on local state
    posts = posts.map(post => ({
      ...post,
      isLiked: likedPosts.has(post.id),
      likes: post.isLiked ? post.likes : (likedPosts.has(post.id) ? post.likes + 1 : post.likes)
    }));

    const followingList = getFollowingList();

    switch (activeFilter) {
      case 'following':
        // Show posts from users the person follows
        const followingPosts = posts.filter(post => followingList.includes(post.authorId));
        // If not following anyone yet, show a helpful empty state by returning empty array
        return followingPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      case 'explore':
        // Personalized discovery feed - mix of trending and recent content
        // Sort by engagement (likes + comments) with recency boost
        return posts.sort((a, b) => {
          const scoreA = (a.likes + a.comments * 2) / Math.max(1, (Date.now() - a.timestamp.getTime()) / (1000 * 60 * 60));
          const scoreB = (b.likes + b.comments * 2) / Math.max(1, (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60));
          return scoreB - scoreA;
        });
      
      case 'ask':
        // Q&A community posts - filter for help-needed tags or question-like content
        return posts.filter(post => 
          post.tags?.some(tag => 
            tag.includes('help') || 
            tag.includes('question') || 
            tag.includes('thesis') ||
            tag.includes('struggling')
          ) || 
          post.content.toLowerCase().includes('?') ||
          post.content.toLowerCase().includes('help') ||
          post.content.toLowerCase().includes('advice')
        ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      default:
        return posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
  }, [activeFilter, likedPosts, getFollowingList]);

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
    router.push(`/post/${postId}`);
  };



  const handleAuthorPress = (authorId: string) => {
    // Navigate to author profile
    router.push(`/consultant/${authorId}`);
  };

  const filters = [
    { key: 'following' as FilterType, label: 'Following', icon: Users },
    { key: 'explore' as FilterType, label: 'Explore', icon: Globe },
    { key: 'ask' as FilterType, label: 'Ask', icon: HelpCircle },
  ];

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onAuthorPress={handleAuthorPress}
    />
  );

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    let total = 5;

    if (user.name) completed++;
    if (user.bio) completed++;
    if (user.specialties && user.specialties.length > 0) completed++;
    if (user.portfolio && user.portfolio.length > 0) completed++;
    if (user.location) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const showProfileReminder = !hasCompletedOnboarding || profileCompletion < 60;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Architect'}</Text>
        </View>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push('/messages')}
        >
          <MessageCircle size={24} color={Colors.text} />
          {getTotalUnreadCount() > 0 && (
            <View style={styles.messageBadge}>
              <Text style={styles.messageBadgeText}>
                {getTotalUnreadCount() > 9 ? '9+' : getTotalUnreadCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showProfileReminder && (
        <View style={styles.profileReminderWrapper}>
          <TouchableOpacity 
            style={styles.profileReminderCard}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.7}
          >
            <View style={styles.profileReminderIcon}>
              <UserCircle size={24} color={Colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.profileReminderContent}>
              <Text style={styles.profileReminderTitle}>Complete Your Profile</Text>
              <Text style={styles.profileReminderText}>
                {profileCompletion}% complete • Add more details to get discovered
              </Text>
            </View>
            <ArrowRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      )}
      
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

  const renderEmptyState = () => {
    if (activeFilter === 'following' && getFollowingList().length === 0) {
      return (
        <View style={styles.emptyState}>
          <Users size={48} color={Colors.textLight} strokeWidth={1.5} />
          <Text style={styles.emptyStateTitle}>Not Following Anyone Yet</Text>
          <Text style={styles.emptyStateText}>
            Discover and follow mentors, students, and professionals to see their posts here.
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => setActiveFilter('explore')}
          >
            <Text style={styles.exploreButtonText}>Explore Feed</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredPosts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <HelpCircle size={48} color={Colors.textLight} strokeWidth={1.5} />
          <Text style={styles.emptyStateTitle}>No Posts Found</Text>
          <Text style={styles.emptyStateText}>
            Try switching to a different tab or check back later.
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
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
  messageButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  messageBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  messageBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  profileReminderWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  profileReminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  profileReminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileReminderContent: {
    flex: 1,
  },
  profileReminderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  profileReminderText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
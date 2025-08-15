import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react-native';
import { Post } from '@/types/user';
import { Colors } from '@/constants/colors';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onAuthorPress: (authorId: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const imageWidth = screenWidth - 32; // Account for padding

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onAuthorPress,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const getAuthorTypeColor = (type: string) => {
    switch (type) {
      case 'student':
        return Colors.success;
      case 'mentor':
        return Colors.primary;
      case 'professor':
        return Colors.warning;
      default:
        return Colors.textLight;
    }
  };

  const getAuthorTypeBadge = (type: string) => {
    switch (type) {
      case 'student':
        return 'Student';
      case 'mentor':
        return 'Mentor';
      case 'professor':
        return 'Professor';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.authorInfo}
          onPress={() => onAuthorPress(post.authorId)}
        >
          <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
          <View style={styles.authorDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <View style={[styles.badge, { backgroundColor: getAuthorTypeColor(post.authorType) }]}>
                <Text style={styles.badgeText}>{getAuthorTypeBadge(post.authorType)}</Text>
              </View>
            </View>
            <Text style={styles.authorTitle}>{post.authorTitle}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
        >
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
              setCurrentImageIndex(index);
            }}
          >
            {post.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {post.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {post.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <Heart 
            size={20} 
            color={post.isLiked ? Colors.error : Colors.textLight}
            fill={post.isLiked ? Colors.error : 'none'}
          />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onComment(post.id)}
        >
          <MessageCircle size={20} color={Colors.textLight} />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onShare(post.id)}
        >
          <Share size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginBottom: 8,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  authorTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  imagesContainer: {
    marginBottom: 12,
  },
  postImage: {
    width: imageWidth,
    height: 240,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: Colors.error,
  },
});
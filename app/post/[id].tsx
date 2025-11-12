import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Heart, MessageCircle, Send, ArrowLeft, Share } from 'lucide-react-native';
import { mockPosts } from '@/data/mockPosts';
import { Comment } from '@/types/user';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { ShareModal } from '@/components/ShareModal';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      postId: id as string,
      authorId: '9',
      authorName: 'John Smith',
      authorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face',
      content: 'This is amazing work! I love the attention to detail.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 5,
      isLiked: false,
    },
    {
      id: '2',
      postId: id as string,
      authorId: '10',
      authorName: 'Maria Garcia',
      authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      content: 'Could you share more about the materials used?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      likes: 2,
      isLiked: false,
    },
  ]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const post = useMemo(() => {
    return mockPosts.find((p) => p.id === id);
  }, [id]);

  if (!post) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Post',
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </>
    );
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      postId: post.id,
      authorId: user?.id || 'current-user',
      authorName: user?.name || 'You',
      authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
      content: commentText,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleLikePost = () => {
    setIsLiked(!isLiked);
  };

  const commentsWithLikes = useMemo(() => {
    return comments.map((comment) => ({
      ...comment,
      isLiked: likedComments.has(comment.id),
      likes: comment.isLiked
        ? comment.likes
        : likedComments.has(comment.id)
        ? comment.likes + 1
        : comment.likes,
    }));
  }, [comments, likedComments]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Post',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Share size={20} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity
              style={styles.authorInfo}
              onPress={() => router.push(`/consultant/${post.authorId}`)}
            >
              <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.authorTitle}>{post.authorTitle}</Text>
                <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <Text style={styles.content}>{post.content}</Text>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}
              contentContainerStyle={styles.imagesContent}
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
          )}

          {/* Post Tags */}
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

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLikePost}>
              <Heart
                size={24}
                color={isLiked ? Colors.error : Colors.textLight}
                fill={isLiked ? Colors.error : 'none'}
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {post.likes + (isLiked ? 1 : 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={24} color={Colors.textLight} />
              <Text style={styles.actionText}>{commentsWithLikes.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({commentsWithLikes.length})
            </Text>

            {commentsWithLikes.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.authorAvatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                    <Text style={styles.commentTimestamp}>
                      {formatTimeAgo(comment.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <TouchableOpacity
                    style={styles.commentLikeButton}
                    onPress={() => handleLikeComment(comment.id)}
                  >
                    <Heart
                      size={14}
                      color={comment.isLiked ? Colors.error : Colors.textLight}
                      fill={comment.isLiked ? Colors.error : 'none'}
                    />
                    {comment.likes > 0 && (
                      <Text
                        style={[
                          styles.commentLikeText,
                          comment.isLiked && styles.commentLikedText,
                        ]}
                      >
                        {comment.likes}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareContent={{
            title: `Check out this post by ${post.authorName}`,
            message: `${post.content}\n\n- ${post.authorName}, ${post.authorTitle}`,
            url: `https://rork.app/post/${post.id}`,
          }}
          type="post"
        />

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <Image
            source={{
              uri:
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face',
            }}
            style={styles.inputAvatar}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.textLight}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !commentText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Send
              size={20}
              color={commentText.trim() ? Colors.primary : Colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  shareButton: {
    padding: 8,
    marginRight: -8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  postHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  authorInfo: {
    flexDirection: 'row',
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
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
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
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    padding: 16,
  },
  imagesContainer: {
    marginBottom: 16,
  },
  imagesContent: {
    paddingHorizontal: 16,
  },
  postImage: {
    width: 280,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
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
  commentsSection: {
    padding: 16,
    paddingBottom: 100,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    marginBottom: 6,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
  commentLikedText: {
    color: Colors.error,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 80,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

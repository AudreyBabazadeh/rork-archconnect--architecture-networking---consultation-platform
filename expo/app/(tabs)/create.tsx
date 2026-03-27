import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Image as ImageIcon,
  FileText,
  Link,
  X,
  Send,
  ArrowLeft,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'link';
  uri?: string;
  name: string;
  size?: number;
  url?: string;
}

export default function CreatePost() {
  const [postText, setPostText] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showLinkInput, setShowLinkInput] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map((asset: any, index: number) => ({
          id: `image_${Date.now()}_${index}`,
          type: 'image',
          uri: asset.uri,
          name: asset.fileName || `image_${index + 1}.jpg`,
          size: asset.fileSize,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCameraPicker = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: `camera_${Date.now()}`,
          type: 'image',
          uri: asset.uri,
          name: asset.fileName || 'camera_photo.jpg',
          size: asset.fileSize,
        };
        setAttachments(prev => [...prev, newAttachment]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments: Attachment[] = result.assets.map((asset: any, index: number) => ({
          id: `doc_${Date.now()}_${index}`,
          type: 'document',
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      const newLink: Attachment = {
        id: `link_${Date.now()}`,
        type: 'link',
        name: linkUrl,
        url: linkUrl,
      };
      setAttachments(prev => [...prev, newLink]);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handlePost = async () => {
    if (!postText.trim() && attachments.length === 0) {
      Alert.alert('Empty Post', 'Please add some content or attachments to your post.');
      return;
    }

    setIsPosting(true);
    try {
      console.log('Creating post:', {
        text: postText,
        attachments: attachments.length,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Your post has been created!', [
        {
          text: 'OK',
          onPress: () => {
            setPostText('');
            setAttachments([]);
            router.push('/home');
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.postButton, (!postText.trim() && attachments.length === 0) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={isPosting || (!postText.trim() && attachments.length === 0)}
          testID="post-button"
        >
          <Send size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind? Share your thoughts, insights, or ask a question..."
            placeholderTextColor={Colors.textLight}
            multiline
            value={postText}
            onChangeText={setPostText}
            maxLength={2000}
            testID="post-text-input"
          />
          <Text style={styles.characterCount}>
            {postText.length}/2000
          </Text>
        </View>

        {attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentsTitle}>Attachments ({attachments.length})</Text>
            {attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachmentItem}>
                <View style={styles.attachmentInfo}>
                  {attachment.type === 'image' && (
                    <View style={styles.imageAttachmentContainer}>
                      <ImageIcon size={20} color={Colors.primary} />
                      {attachment.uri && (
                        <Image source={{ uri: attachment.uri }} style={styles.attachmentPreview} />
                      )}
                    </View>
                  )}
                  {attachment.type === 'document' && (
                    <FileText size={20} color={Colors.primary} />
                  )}
                  {attachment.type === 'link' && (
                    <Link size={20} color={Colors.primary} />
                  )}
                  <View style={styles.attachmentDetails}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                    {attachment.size && (
                      <Text style={styles.attachmentSize}>
                        {formatFileSize(attachment.size)}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeAttachment(attachment.id)}
                  testID={`remove-attachment-${attachment.id}`}
                >
                  <X size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {showLinkInput && (
          <View style={styles.linkInputContainer}>
            <TextInput
              style={styles.linkInput}
              placeholder="Enter URL (https://example.com)"
              placeholderTextColor={Colors.textLight}
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              keyboardType="url"
              testID="link-input"
            />
            <View style={styles.linkActions}>
              <TouchableOpacity
                style={styles.linkActionButton}
                onPress={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
              >
                <Text style={styles.linkActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.linkActionButton, styles.addLinkButton]}
                onPress={handleAddLink}
                disabled={!linkUrl.trim()}
              >
                <Text style={[styles.linkActionText, styles.addLinkText]}>Add Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleCameraPicker}
          testID="camera-button"
        >
          <Camera size={24} color={Colors.primary} />
          <Text style={styles.toolbarButtonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleImagePicker}
          testID="gallery-button"
        >
          <ImageIcon size={24} color={Colors.primary} />
          <Text style={styles.toolbarButtonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleDocumentPicker}
          testID="document-button"
        >
          <FileText size={24} color={Colors.primary} />
          <Text style={styles.toolbarButtonText}>Files</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => setShowLinkInput(true)}
          testID="link-button"
        >
          <Link size={24} color={Colors.primary} />
          <Text style={styles.toolbarButtonText}>Link</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  textInputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  attachmentsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 8,
  },
  attachmentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  attachmentSize: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  linkInputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkInput: {
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  linkActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  linkActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addLinkButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  linkActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  addLinkText: {
    color: Colors.white,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    justifyContent: 'space-around',
  },
  toolbarButton: {
    alignItems: 'center',
    padding: 8,
  },
  toolbarButtonText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  imageAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
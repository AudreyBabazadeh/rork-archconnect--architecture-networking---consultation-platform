import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Share as RNShare,
  Alert,
  Platform,
} from 'react-native';
import { X, Search, Send } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { mockUsers } from '@/data/mockUsers';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  shareContent: {
    title: string;
    message: string;
    url?: string;
  };
  type: 'post' | 'profile';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  shareContent,
  type,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSendToUsers = () => {
    if (selectedUsers.size === 0) {
      Alert.alert('No users selected', 'Please select at least one user to share with');
      return;
    }

    Alert.alert(
      'Success',
      `${type === 'post' ? 'Post' : 'Profile'} shared with ${selectedUsers.size} user${
        selectedUsers.size > 1 ? 's' : ''
      }`
    );
    setSelectedUsers(new Set());
    setSearchQuery('');
    onClose();
  };

  const handleShareExternal = async () => {
    try {
      const result = await RNShare.share({
        title: shareContent.title,
        message: shareContent.message,
        url: shareContent.url,
      });

      if (result.action === RNShare.sharedAction) {
        if (result.activityType) {
          console.log('Shared via:', result.activityType);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            style={styles.usersList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.usersListContent}
          >
            {filteredUsers.map((user) => {
              const isSelected = selectedUsers.has(user.id);
              return (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userItem}
                  onPress={() => handleToggleUser(user.id)}
                >
                  <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userTitle} numberOfLines={1}>
                      {user.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.checkboxInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            {selectedUsers.size > 0 && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendToUsers}
              >
                <Send size={20} color={Colors.white} />
                <Text style={styles.sendButtonText}>
                  Send to {selectedUsers.size}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.shareExternalButton}
              onPress={handleShareExternal}
            >
              <Text style={styles.shareExternalText}>Share to...</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  usersList: {
    maxHeight: 400,
  },
  usersListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  shareExternalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
  },
  shareExternalText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});

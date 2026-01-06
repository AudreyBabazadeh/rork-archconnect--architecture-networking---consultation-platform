import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { mockUsers } from '@/data/mockUsers';
import { useMessaging } from '@/contexts/MessagingContext';
import { useFollow } from '@/contexts/FollowContext';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, participantIds: string[]) => void;
}

export default function CreateGroupModal({
  visible,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { conversations } = useMessaging();
  const { getFollowingList } = useFollow();

  const availableUsers = mockUsers.filter((u) => u.id !== '1');
  
  const suggestedUsers = useMemo(() => {
    const interactionMap = new Map<string, number>();
    
    conversations.forEach(conv => {
      if (!conv.isGroup) {
        const count = conv.messages.length;
        interactionMap.set(conv.participantId, count);
      } else if (conv.participants) {
        conv.participants.forEach(p => {
          const current = interactionMap.get(p.id) || 0;
          interactionMap.set(p.id, current + 1);
        });
      }
    });
    
    const followingIds = getFollowingList();
    
    const usersWithScores = availableUsers.map(user => {
      const interactionScore = interactionMap.get(user.id) || 0;
      const followingScore = followingIds.includes(user.id) ? 100 : 0;
      return {
        user,
        score: interactionScore + followingScore,
      };
    });
    
    return usersWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.user);
  }, [conversations, getFollowingList, availableUsers]);
  
  const normalizedQuery = searchQuery.startsWith('@') ? searchQuery.slice(1).toLowerCase() : searchQuery.toLowerCase();
  const isSearchingWithAt = searchQuery.startsWith('@');
  
  const filteredUsers = useMemo(() => {
    if (isSearchingWithAt && normalizedQuery === '') {
      return suggestedUsers;
    }
    
    return availableUsers.filter((user) => {
      if (isSearchingWithAt) {
        return user.username.toLowerCase().includes(normalizedQuery);
      }
      return user.name.toLowerCase().includes(normalizedQuery) || user.username.toLowerCase().includes(normalizedQuery);
    });
  }, [normalizedQuery, isSearchingWithAt, availableUsers, suggestedUsers]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      onCreateGroup(groupName.trim(), selectedUsers);
      setGroupName('');
      setSelectedUsers([]);
      setSearchQuery('');
      onClose();
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedUsers([]);
    setSearchQuery('');
    onClose();
  };

  const selectedUsersList = availableUsers.filter((u) =>
    selectedUsers.includes(u.id)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Group Chat</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name..."
              placeholderTextColor={Colors.textLight}
              maxLength={50}
            />
          </View>

          {selectedUsersList.length > 0 && (
            <View style={styles.selectedSection}>
              <Text style={styles.label}>
                Selected ({selectedUsersList.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectedScroll}
                contentContainerStyle={styles.selectedContent}
              >
                {selectedUsersList.map((user) => (
                  <View key={user.id} style={styles.selectedUser}>
                    <Image
                      source={{ uri: user.avatar }}
                      style={styles.selectedAvatar}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => toggleUserSelection(user.id)}
                    >
                      <X size={14} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.searchSection}>
            <Text style={styles.label}>Add Members (minimum 2)</Text>
            <TextInput
              style={styles.input}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowSuggestions(text.startsWith('@') && text.length === 1);
              }}
              placeholder="Search by name or @username"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => {
                if (searchQuery === '@') {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            {showSuggestions && isSearchingWithAt && normalizedQuery === '' && (
              <View style={styles.suggestionsDropdown}>
                <Text style={styles.suggestionsHeader}>Suggested</Text>
                <ScrollView 
                  style={styles.suggestionsList}
                  keyboardShouldPersistTaps="handled"
                >
                  {suggestedUsers.map((user) => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.suggestionItem}
                        onPress={() => {
                          toggleUserSelection(user.id);
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                      >
                        <Image
                          source={{ uri: user.avatar }}
                          style={styles.suggestionAvatar}
                        />
                        <View style={styles.suggestionInfo}>
                          <Text style={styles.suggestionName}>{user.name}</Text>
                          <Text style={styles.suggestionUsername}>@{user.username}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.selectedIndicator}>
                            <Check size={14} color={Colors.primary} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            style={styles.userList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedUsers.includes(item.id);
              return (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => toggleUserSelection(item.id)}
                >
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userUsername}>@{item.username}</Text>
                    <Text style={styles.userTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && <Check size={16} color={Colors.white} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.createButton,
                (!groupName.trim() || selectedUsers.length < 2) &&
                  styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!groupName.trim() || selectedUsers.length < 2}
            >
              <Text
                style={[
                  styles.createButtonText,
                  (!groupName.trim() || selectedUsers.length < 2) &&
                    styles.createButtonTextDisabled,
                ]}
              >
                Create Group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  selectedSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  selectedScroll: {
    marginTop: 8,
  },
  selectedContent: {
    paddingRight: 20,
  },
  selectedUser: {
    marginRight: 12,
    position: 'relative',
  },
  selectedAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  userList: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  createButtonTextDisabled: {
    color: Colors.textLight,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  suggestionUsername: {
    fontSize: 13,
    color: Colors.primary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

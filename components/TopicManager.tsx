import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { Plus, X, Edit3, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Topic } from '@/types/user';
import { getFilteredSuggestions } from '@/constants/topicSuggestions';

interface TopicManagerProps {
  topics: Topic[];
  onTopicsChange: (topics: Topic[]) => void;
}

export function TopicManager({ topics, onTopicsChange }: TopicManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicDuration, setTopicDuration] = useState('60');
  const [topicPrice, setTopicPrice] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleTopicNameChange = useCallback((text: string) => {
    setTopicName(text);
    const filteredSuggestions = getFilteredSuggestions(text);
    setSuggestions(filteredSuggestions);
    setShowSuggestions(text.length > 0 && filteredSuggestions.length > 0);
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    setTopicName(suggestion);
    setShowSuggestions(false);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingTopic(null);
    setTopicName('');
    setTopicDescription('');
    setTopicDuration('60');
    setTopicPrice('');
    setShowAddModal(true);
  }, []);

  const openEditModal = useCallback((topic: Topic) => {
    setEditingTopic(topic);
    setTopicName(topic.name);
    setTopicDescription(topic.description);
    setTopicDuration(topic.duration.toString());
    setTopicPrice(topic.price.toString());
    setShowAddModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditingTopic(null);
    setTopicName('');
    setTopicDescription('');
    setTopicDuration('60');
    setTopicPrice('');
    setShowSuggestions(false);
  }, []);

  const saveTopic = useCallback(() => {
    if (!topicName.trim()) {
      Alert.alert('Error', 'Topic name is required');
      return;
    }

    if (!topicPrice.trim() || isNaN(Number(topicPrice))) {
      Alert.alert('Error', 'Valid price is required');
      return;
    }

    const duration = parseInt(topicDuration) || 60;
    const price = parseFloat(topicPrice);

    const newTopic: Topic = {
      id: editingTopic?.id || Date.now().toString(),
      name: topicName.trim(),
      description: topicDescription.trim(),
      duration,
      price,
      isActive: true,
    };

    if (editingTopic) {
      const updatedTopics = topics.map(t => 
        t.id === editingTopic.id ? newTopic : t
      );
      onTopicsChange(updatedTopics);
    } else {
      onTopicsChange([...topics, newTopic]);
    }

    closeModal();
  }, [topicName, topicDescription, topicDuration, topicPrice, editingTopic, topics, onTopicsChange, closeModal]);

  const deleteTopic = useCallback((topicId: string) => {
    Alert.alert(
      'Delete Topic',
      'Are you sure you want to delete this topic?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTopics = topics.filter(t => t.id !== topicId);
            onTopicsChange(updatedTopics);
          },
        },
      ]
    );
  }, [topics, onTopicsChange]);

  const toggleTopicActive = useCallback((topicId: string) => {
    const updatedTopics = topics.map(t =>
      t.id === topicId ? { ...t, isActive: !t.isActive } : t
    );
    onTopicsChange(updatedTopics);
  }, [topics, onTopicsChange]);

  const renderTopicItem = ({ item }: { item: Topic }) => (
    <View style={[styles.topicItem, !item.isActive && styles.inactiveTopic]}>
      <View style={styles.topicInfo}>
        <Text style={[styles.topicName, !item.isActive && styles.inactiveText]}>
          {item.name}
        </Text>
        {item.description ? (
          <Text style={[styles.topicDescription, !item.isActive && styles.inactiveText]}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.topicDetails}>
          <Text style={[styles.topicDetail, !item.isActive && styles.inactiveText]}>
            {item.duration} min
          </Text>
          <Text style={[styles.topicDetail, !item.isActive && styles.inactiveText]}>
            ${item.price}
          </Text>
        </View>
      </View>
      <View style={styles.topicActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleTopicActive(item.id)}
        >
          <Text style={[styles.actionButtonText, { color: item.isActive ? Colors.success : Colors.textLight }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Edit3 size={16} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteTopic(item.id)}
        >
          <Trash2 size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => selectSuggestion(item)}
    >
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Topics</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Add Topic</Text>
        </TouchableOpacity>
      </View>

      {topics.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No topics added yet</Text>
          <Text style={styles.emptySubtext}>
            Add topics to let others know what you can help with
          </Text>
        </View>
      ) : (
        <FlatList
          data={topics}
          renderItem={renderTopicItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTopic ? 'Edit Topic' : 'Add New Topic'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Topic Name *</Text>
              <TextInput
                style={styles.input}
                value={topicName}
                onChangeText={handleTopicNameChange}
                placeholder="e.g., Portfolio Review, AutoCAD Training"
                onFocus={() => {
                  if (topicName.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={suggestions}
                    renderItem={renderSuggestionItem}
                    keyExtractor={(item) => item}
                    style={styles.suggestionsList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={topicDescription}
                onChangeText={setTopicDescription}
                placeholder="Describe what this topic includes..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Duration (minutes) *</Text>
                <TextInput
                  style={styles.input}
                  value={topicDuration}
                  onChangeText={setTopicDuration}
                  placeholder="60"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Price (USD) *</Text>
                <TextInput
                  style={styles.input}
                  value={topicPrice}
                  onChangeText={setTopicPrice}
                  placeholder="50"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveTopic}>
              <Text style={styles.saveButtonText}>
                {editingTopic ? 'Update Topic' : 'Add Topic'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  topicItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inactiveTopic: {
    opacity: 0.6,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  topicDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  topicDetail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  inactiveText: {
    color: Colors.textLight,
  },
  topicActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  suggestionsContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
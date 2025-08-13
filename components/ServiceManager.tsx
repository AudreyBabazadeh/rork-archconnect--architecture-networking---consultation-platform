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
import { Service } from '@/types/user';
import { getFilteredSuggestions } from '@/constants/serviceSuggestions';

interface ServiceManagerProps {
  services: Service[];
  onServicesChange: (services: Service[]) => void;
}

export function ServiceManager({ services, onServicesChange }: ServiceManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');
  const [servicePrice, setServicePrice] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleServiceNameChange = useCallback((text: string) => {
    setServiceName(text);
    const filteredSuggestions = getFilteredSuggestions(text);
    setSuggestions(filteredSuggestions);
    setShowSuggestions(text.length > 0 && filteredSuggestions.length > 0);
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    setServiceName(suggestion);
    setShowSuggestions(false);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingService(null);
    setServiceName('');
    setServiceDescription('');
    setServiceDuration('60');
    setServicePrice('');
    setShowAddModal(true);
  }, []);

  const openEditModal = useCallback((service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description);
    setServiceDuration(service.duration.toString());
    setServicePrice(service.price.toString());
    setShowAddModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditingService(null);
    setServiceName('');
    setServiceDescription('');
    setServiceDuration('60');
    setServicePrice('');
    setShowSuggestions(false);
  }, []);

  const saveService = useCallback(() => {
    if (!serviceName.trim()) {
      Alert.alert('Error', 'Service name is required');
      return;
    }

    if (!servicePrice.trim() || isNaN(Number(servicePrice))) {
      Alert.alert('Error', 'Valid price is required');
      return;
    }

    const duration = parseInt(serviceDuration) || 60;
    const price = parseFloat(servicePrice);

    const newService: Service = {
      id: editingService?.id || Date.now().toString(),
      name: serviceName.trim(),
      description: serviceDescription.trim(),
      duration,
      price,
      isActive: true,
    };

    if (editingService) {
      const updatedServices = services.map(s => 
        s.id === editingService.id ? newService : s
      );
      onServicesChange(updatedServices);
    } else {
      onServicesChange([...services, newService]);
    }

    closeModal();
  }, [serviceName, serviceDescription, serviceDuration, servicePrice, editingService, services, onServicesChange, closeModal]);

  const deleteService = useCallback((serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedServices = services.filter(s => s.id !== serviceId);
            onServicesChange(updatedServices);
          },
        },
      ]
    );
  }, [services, onServicesChange]);

  const toggleServiceActive = useCallback((serviceId: string) => {
    const updatedServices = services.map(s =>
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    );
    onServicesChange(updatedServices);
  }, [services, onServicesChange]);

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={[styles.serviceItem, !item.isActive && styles.inactiveService]}>
      <View style={styles.serviceInfo}>
        <Text style={[styles.serviceName, !item.isActive && styles.inactiveText]}>
          {item.name}
        </Text>
        {item.description ? (
          <Text style={[styles.serviceDescription, !item.isActive && styles.inactiveText]}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.serviceDetails}>
          <Text style={[styles.serviceDetail, !item.isActive && styles.inactiveText]}>
            {item.duration} min
          </Text>
          <Text style={[styles.serviceDetail, !item.isActive && styles.inactiveText]}>
            ${item.price}
          </Text>
        </View>
      </View>
      <View style={styles.serviceActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleServiceActive(item.id)}
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
          onPress={() => deleteService(item.id)}
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
        <Text style={styles.title}>Your Services</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {services.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No services added yet</Text>
          <Text style={styles.emptySubtext}>
            Add services to let others know what you can help with
          </Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
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
              {editingService ? 'Edit Service' : 'Add New Service'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Name *</Text>
              <TextInput
                style={styles.input}
                value={serviceName}
                onChangeText={handleServiceNameChange}
                placeholder="e.g., Portfolio Review, AutoCAD Training"
                onFocus={() => {
                  if (serviceName.length > 0) {
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
                value={serviceDescription}
                onChangeText={setServiceDescription}
                placeholder="Describe what this service includes..."
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
                  value={serviceDuration}
                  onChangeText={setServiceDuration}
                  placeholder="60"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Price (USD) *</Text>
                <TextInput
                  style={styles.input}
                  value={servicePrice}
                  onChangeText={setServicePrice}
                  placeholder="50"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveService}>
              <Text style={styles.saveButtonText}>
                {editingService ? 'Update Service' : 'Add Service'}
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
  serviceItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inactiveService: {
    opacity: 0.6,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceDetail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  inactiveText: {
    color: Colors.textLight,
  },
  serviceActions: {
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
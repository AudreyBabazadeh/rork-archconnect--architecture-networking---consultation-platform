import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  specialties: string[];
  priceRange: [number, number];
  experience: string[];
  availability: boolean | null;
  rating: number;
  userType: string[];
}

const specialtyOptions = [
  'Sustainable Design', 'Urban Planning', 'Residential', 'Commercial',
  'Digital Design', 'Parametric Architecture', 'Visualization',
  'Historic Preservation', 'Cultural Architecture', 'Theory',
  'Interior Design', 'Landscape Architecture', 'Construction'
];

const experienceOptions = [
  '0-2 years', '3-5 years', '6-10 years', '10+ years', '15+ years'
];

const userTypeOptions = [
  'Student', 'Graduate Student', 'Professor', 'Professional', 'Senior Architect'
];

export function FilterModal({ visible, onClose, onApplyFilters, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const toggleSpecialty = (specialty: string) => {
    setFilters(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleExperience = (exp: string) => {
    setFilters(prev => ({
      ...prev,
      experience: prev.experience.includes(exp)
        ? prev.experience.filter(e => e !== exp)
        : [...prev.experience, exp]
    }));
  };

  const toggleUserType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      userType: prev.userType.includes(type)
        ? prev.userType.filter(t => t !== type)
        : [...prev.userType, type]
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialties: [],
      priceRange: [0, 200],
      experience: [],
      availability: null,
      rating: 0,
      userType: []
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.optionsGrid}>
              {specialtyOptions.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.optionChip,
                    filters.specialties.includes(specialty) && styles.selectedChip
                  ]}
                  onPress={() => toggleSpecialty(specialty)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.specialties.includes(specialty) && styles.selectedText
                  ]}>
                    {specialty}
                  </Text>
                  {filters.specialties.includes(specialty) && (
                    <Check size={16} color={Colors.white} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience Level</Text>
            <View style={styles.optionsGrid}>
              {experienceOptions.map((exp) => (
                <TouchableOpacity
                  key={exp}
                  style={[
                    styles.optionChip,
                    filters.experience.includes(exp) && styles.selectedChip
                  ]}
                  onPress={() => toggleExperience(exp)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.experience.includes(exp) && styles.selectedText
                  ]}>
                    {exp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Type</Text>
            <View style={styles.optionsGrid}>
              {userTypeOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionChip,
                    filters.userType.includes(type) && styles.selectedChip
                  ]}
                  onPress={() => toggleUserType(type)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.userType.includes(type) && styles.selectedText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRange}>
              <Text style={styles.priceText}>${filters.priceRange[0]} - ${filters.priceRange[1]} per hour</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityOptions}>
              <TouchableOpacity
                style={[
                  styles.availabilityOption,
                  filters.availability === true && styles.selectedChip
                ]}
                onPress={() => setFilters(prev => ({ ...prev, availability: true }))}
              >
                <Text style={[
                  styles.optionText,
                  filters.availability === true && styles.selectedText
                ]}>
                  Available Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.availabilityOption,
                  filters.availability === null && styles.selectedChip
                ]}
                onPress={() => setFilters(prev => ({ ...prev, availability: null }))}
              >
                <Text style={[
                  styles.optionText,
                  filters.availability === null && styles.selectedText
                ]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  clearText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedText: {
    color: Colors.white,
  },
  checkIcon: {
    marginLeft: 6,
  },
  priceRange: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  availabilityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  availabilityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
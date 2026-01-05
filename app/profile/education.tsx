import { router, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  X,
  Link as LinkIcon,
  GraduationCap,
  PlusCircle,
  Check,
  Calendar,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { Education, EducationMedia } from '@/types/user';

export default function EducationScreen() {
  const { user, updateProfile } = useAuth();
  const [educations, setEducations] = useState<Education[]>((user as any)?.educations || []);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    school: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: '',
    activities: '',
    description: '',
    skills: [],
    media: [],
  });

  const resetForm = () => {
    setFormData({
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      activities: '',
      description: '',
      skills: [],
      media: [],
    });
    setEditingId(null);
    setCustomSkillInput('');
    setShowCustomSkillInput(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (education: Education) => {
    setFormData({
      school: education.school,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate,
      endDate: education.endDate,
      grade: education.grade || '',
      activities: education.activities || '',
      description: education.description || '',
      skills: education.skills,
      media: education.media,
    });
    setEditingId(education.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.school.trim() || !formData.degree.trim() || !formData.fieldOfStudy.trim()) {
      Alert.alert('Required Fields', 'Please fill in School, Degree, and Field of Study');
      return;
    }

    const newEducation: Education = {
      id: editingId || `edu_${Date.now()}`,
      ...formData,
    };

    let updatedEducations: Education[];
    if (editingId) {
      updatedEducations = educations.map(edu => 
        edu.id === editingId ? newEducation : edu
      );
    } else {
      updatedEducations = [...educations, newEducation];
    }

    setEducations(updatedEducations);
    await updateProfile({ educations: updatedEducations } as any);
    
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Education',
      'Are you sure you want to delete this education entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEducations = educations.filter(edu => edu.id !== id);
            setEducations(updatedEducations);
            await updateProfile({ educations: updatedEducations } as any);
          },
        },
      ]
    );
  };

  const updateFormData = (key: keyof Omit<Education, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addCustomSkill = () => {
    const trimmedSkill = customSkillInput.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      updateFormData('skills', [...formData.skills, trimmedSkill]);
      setCustomSkillInput('');
      setShowCustomSkillInput(false);
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData('skills', formData.skills.filter(s => s !== skill));
  };

  const addMediaLink = () => {
    Alert.prompt(
      'Add Link',
      'Enter the URL',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (url?: string) => {
            if (url?.trim()) {
              Alert.prompt(
                'Link Title',
                'Enter a title for this link (optional)',
                [
                  { text: 'Skip', onPress: () => {
                    const newMedia: EducationMedia = {
                      id: `media_${Date.now()}`,
                      type: 'link',
                      url: url.trim(),
                    };
                    updateFormData('media', [...formData.media, newMedia]);
                  }},
                  {
                    text: 'Add',
                    onPress: (title?: string) => {
                      const newMedia: EducationMedia = {
                        id: `media_${Date.now()}`,
                        type: 'link',
                        url: url.trim(),
                        title: title?.trim(),
                      };
                      updateFormData('media', [...formData.media, newMedia]);
                    },
                  },
                ]
              );
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const addMediaImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMedia: EducationMedia = {
          id: `media_${Date.now()}`,
          type: 'image',
          url: result.assets[0].uri,
        };
        updateFormData('media', [...formData.media, newMedia]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to add image. Please try again.');
    }
  };

  const removeMedia = (id: string) => {
    updateFormData('media', formData.media.filter(m => m.id !== id));
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Education',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {educations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <GraduationCap size={64} color={Colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>No Education Added Yet</Text>
              <Text style={styles.emptyDescription}>
                Share your academic background to help others understand your expertise and journey.
              </Text>
              <TouchableOpacity style={styles.emptyActionButton} onPress={openAddModal}>
                <Plus size={20} color={Colors.white} />
                <Text style={styles.emptyActionButtonText}>Add Your First Education</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {educations.map((education) => (
                <View key={education.id} style={styles.educationCard}>
                  <View style={styles.educationHeader}>
                    <View style={styles.educationIconContainer}>
                      <GraduationCap size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.educationHeaderContent}>
                      <Text style={styles.educationSchool}>{education.school}</Text>
                      <Text style={styles.educationDegree}>
                        {education.degree} - {education.fieldOfStudy}
                      </Text>
                      <View style={styles.educationDateContainer}>
                        <Calendar size={14} color={Colors.textLight} />
                        <Text style={styles.educationDate}>
                          {education.startDate} - {education.endDate}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {education.grade && (
                    <View style={styles.educationDetail}>
                      <Text style={styles.detailLabel}>Grade:</Text>
                      <Text style={styles.detailValue}>{education.grade}</Text>
                    </View>
                  )}

                  {education.activities && (
                    <View style={styles.educationDetail}>
                      <Text style={styles.detailLabel}>Activities & Societies:</Text>
                      <Text style={styles.detailValue}>{education.activities}</Text>
                    </View>
                  )}

                  {education.description && (
                    <View style={styles.educationDetail}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{education.description}</Text>
                    </View>
                  )}

                  {education.skills.length > 0 && (
                    <View style={styles.educationDetail}>
                      <Text style={styles.detailLabel}>Skills:</Text>
                      <View style={styles.skillsContainer}>
                        {education.skills.map((skill, index) => (
                          <View key={index} style={styles.skillTag}>
                            <Text style={styles.skillTagText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {education.media.length > 0 && (
                    <View style={styles.educationDetail}>
                      <Text style={styles.detailLabel}>Media ({education.media.length}):</Text>
                      <View style={styles.mediaPreview}>
                        {education.media.slice(0, 3).map((media) => (
                          <View key={media.id} style={styles.mediaIcon}>
                            {media.type === 'link' ? (
                              <LinkIcon size={16} color={Colors.primary} />
                            ) : (
                              <View style={styles.imageIconPlaceholder}>
                                <Text style={styles.imageIconText}>📷</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(education)}
                    >
                      <Edit2 size={18} color={Colors.primary} />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(education.id)}
                    >
                      <Trash2 size={18} color={Colors.error} />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {educations.length > 0 && (
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Plus size={20} color={Colors.white} />
              <Text style={styles.addButtonText}>Add Another Education</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Education' : 'Add Education'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>School *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.school}
                  onChangeText={(value) => updateFormData('school', value)}
                  placeholder="e.g., MIT School of Architecture"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Degree *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.degree}
                  onChangeText={(value) => updateFormData('degree', value)}
                  placeholder="e.g., Master of Architecture"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Field of Study *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fieldOfStudy}
                  onChangeText={(value) => updateFormData('fieldOfStudy', value)}
                  placeholder="e.g., Sustainable Architecture"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.label}>Start Date *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.startDate}
                    onChangeText={(value) => updateFormData('startDate', value)}
                    placeholder="e.g., Sep 2018"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.label}>End Date *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.endDate}
                    onChangeText={(value) => updateFormData('endDate', value)}
                    placeholder="e.g., May 2020"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Grade / GPA</Text>
                <TextInput
                  style={styles.input}
                  value={formData.grade}
                  onChangeText={(value) => updateFormData('grade', value)}
                  placeholder="e.g., 3.8 / 4.0"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Activities & Societies</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.activities}
                  onChangeText={(value) => updateFormData('activities', value)}
                  placeholder="e.g., Architecture Club President, Student Council Member"
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => updateFormData('description', value)}
                  placeholder="Describe your experience, achievements, and what you learned..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Skills</Text>
                <Text style={styles.helpText}>
                  Add skills you developed during this education
                </Text>
                {formData.skills.length > 0 && (
                  <View style={styles.selectedSkillsContainer}>
                    {formData.skills.map((skill) => (
                      <View key={skill} style={styles.selectedSkill}>
                        <Text style={styles.selectedSkillText}>{skill}</Text>
                        <TouchableOpacity
                          onPress={() => removeSkill(skill)}
                          style={styles.removeSkillButton}
                        >
                          <X size={14} color={Colors.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {showCustomSkillInput ? (
                  <View style={styles.customSkillInputContainer}>
                    <TextInput
                      style={styles.customSkillInput}
                      value={customSkillInput}
                      onChangeText={setCustomSkillInput}
                      placeholder="Enter skill..."
                      placeholderTextColor={Colors.textLight}
                      autoFocus
                    />
                    <View style={styles.customSkillActions}>
                      <TouchableOpacity
                        style={styles.customSkillButton}
                        onPress={addCustomSkill}
                        disabled={!customSkillInput.trim()}
                      >
                        <Check size={18} color={Colors.white} />
                        <Text style={styles.customSkillButtonText}>Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.customSkillButton, styles.cancelButton]}
                        onPress={() => {
                          setShowCustomSkillInput(false);
                          setCustomSkillInput('');
                        }}
                      >
                        <X size={18} color={Colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addSkillButton}
                    onPress={() => setShowCustomSkillInput(true)}
                  >
                    <PlusCircle size={20} color={Colors.primary} />
                    <Text style={styles.addSkillButtonText}>Add Skill</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Media</Text>
                <Text style={styles.helpText}>
                  Add images or links to projects, certificates, or relevant resources
                </Text>
                {formData.media.length > 0 && (
                  <View style={styles.mediaList}>
                    {formData.media.map((media) => (
                      <View key={media.id} style={styles.mediaItem}>
                        <View style={styles.mediaItemContent}>
                          {media.type === 'link' ? (
                            <LinkIcon size={20} color={Colors.primary} />
                          ) : (
                            <Text style={styles.mediaTypeIcon}>📷</Text>
                          )}
                          <View style={styles.mediaItemText}>
                            <Text style={styles.mediaItemTitle} numberOfLines={1}>
                              {media.title || media.url}
                            </Text>
                            <Text style={styles.mediaItemType}>
                              {media.type === 'link' ? 'Link' : 'Image'}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity onPress={() => removeMedia(media.id)}>
                          <Trash2 size={18} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.mediaActions}>
                  <TouchableOpacity
                    style={styles.mediaActionButton}
                    onPress={addMediaImage}
                  >
                    <Text style={styles.mediaActionButtonText}>📷 Add Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mediaActionButton}
                    onPress={addMediaLink}
                  >
                    <LinkIcon size={18} color={Colors.primary} />
                    <Text style={styles.mediaActionButtonText}>Add Link</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingId ? 'Update Education' : 'Add Education'}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  listContainer: {
    padding: 20,
  },
  educationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  educationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  educationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  educationHeaderContent: {
    flex: 1,
  },
  educationSchool: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  educationDegree: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 6,
  },
  educationDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  educationDate: {
    fontSize: 13,
    color: Colors.textLight,
  },
  educationDetail: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
  },
  skillTagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  mediaPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  mediaIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageIconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIconText: {
    fontSize: 18,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.error + '10',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    height: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectedSkill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  selectedSkillText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  removeSkillButton: {
    padding: 2,
  },
  customSkillInputContainer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  customSkillInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  customSkillActions: {
    flexDirection: 'row',
    gap: 8,
  },
  customSkillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  customSkillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  cancelButton: {
    flex: 0,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addSkillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addSkillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  mediaList: {
    marginBottom: 12,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  mediaItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  mediaTypeIcon: {
    fontSize: 20,
  },
  mediaItemText: {
    flex: 1,
  },
  mediaItemTitle: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  mediaItemType: {
    fontSize: 12,
    color: Colors.textLight,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  mediaActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

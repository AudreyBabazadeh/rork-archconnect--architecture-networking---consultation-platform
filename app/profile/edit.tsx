import { router, Stack } from 'expo-router';
import { 
  Camera, 
  Check, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Plus, 
  X,
  Linkedin,
  Globe,
  Instagram,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  ActionSheetIOS,
  Platform,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';


const COMMON_EXPERTISE_TAGS = [
  'Sustainable Design',
  'Urban Planning',
  'Portfolio Review',
  'Residential Design',
  'Commercial Design',
  'Interior Architecture',
  'Landscape Architecture',
  'CAD/Revit',
  'SketchUp',
  '3D Visualization',
  'Construction Documents',
  'Thesis Guidance',
  'Career Advice',
  'Technical Drawing',
  'Concept Development',
];

const SESSION_TYPES = ['1-on-1 Video Call', 'Portfolio Review', 'Q&A Session', 'Async Feedback'];
const SESSION_DURATIONS = ['30 min', '60 min', '90 min'];
const PRICING_TIERS = ['Free', 'Moderate', 'Premium', 'Enterprise'];

interface PortfolioImage {
  id: string;
  uri: string;
  caption: string;
}

interface SectionState {
  basic: boolean;
  expertise: boolean;
  portfolio: boolean;
  teaching: boolean;
  links: boolean;
  preferences: boolean;
  personalization: boolean;
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [expandedSections, setExpandedSections] = useState<SectionState>({
    basic: true,
    expertise: false,
    portfolio: false,
    teaching: false,
    links: false,
    preferences: false,
    personalization: false,
  });

  const [formData, setFormData] = useState<any>({
    name: user?.name || '',
    bio: user?.bio || '',
    occupation: user?.occupation || '',
    university: user?.university || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    location: user?.location || '',
    hourlyRate: user?.hourlyRate || 0,
    profileImage: user?.profileImage || '',
    expertiseTags: user?.specialties || [],
    portfolioImages: [] as PortfolioImage[],
    teachingFocus: '',
    howITeach: '',
    idealMentees: '',
    linkedIn: '',
    website: '',
    instagram: '',
    externalPortfolio: '',
    sessionTypes: [] as string[],
    preferredDuration: '60 min',
    pricingTier: 'Moderate',
    coverImage: '',
    accentColor: Colors.primary,
  });


  const calculateProgress = useCallback(() => {
    let completed = 0;
    let total = 7;

    if (formData.name?.trim()) completed++;
    if (formData.bio?.trim()) completed++;
    if (formData.expertiseTags?.length > 0) completed++;
    if (formData.portfolioImages?.length > 0) completed++;
    if (formData.teachingFocus?.trim()) completed++;
    if (formData.sessionTypes?.length > 0) completed++;
    if (formData.linkedIn?.trim() || formData.website?.trim()) completed++;

    return Math.round((completed / total) * 100);
  }, [formData]);

  const autoSave = useCallback(async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [formData, user, updateProfile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && formData.name?.trim()) {
        autoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, autoSave, user]);

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: keyof SectionState) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to change your profile picture.'
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateFormData('profileImage', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateFormData('profileImage', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: pickImageFromCamera },
          { text: 'Choose from Gallery', onPress: pickImageFromGallery },
        ]
      );
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const addExpertiseTag = (tag: string) => {
    if (!formData.expertiseTags.includes(tag)) {
      updateFormData('expertiseTags', [...formData.expertiseTags, tag]);
    }
  };

  const removeExpertiseTag = (tag: string) => {
    updateFormData('expertiseTags', formData.expertiseTags.filter((t: string) => t !== tag));
  };

  const addPortfolioImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: PortfolioImage = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          caption: '',
        };
        updateFormData('portfolioImages', [...formData.portfolioImages, newImage]);
      }
    } catch (error) {
      console.error('Error picking portfolio image:', error);
      Alert.alert('Error', 'Failed to add image. Please try again.');
    }
  };

  const removePortfolioImage = (id: string) => {
    updateFormData('portfolioImages', formData.portfolioImages.filter((img: PortfolioImage) => img.id !== id));
  };

  const updatePortfolioCaption = (id: string, caption: string) => {
    updateFormData(
      'portfolioImages',
      formData.portfolioImages.map((img: PortfolioImage) => 
        img.id === id ? { ...img, caption } : img
      )
    );
  };

  const toggleSessionType = (type: string) => {
    const types = formData.sessionTypes || [];
    if (types.includes(type)) {
      updateFormData('sessionTypes', types.filter((t: string) => t !== type));
    } else {
      updateFormData('sessionTypes', [...types, type]);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to edit your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: '',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerBackButton}
              onPress={() => router.back()}
              testID="back-button"
            >
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerSaveButton}
              onPress={handleSave}
              disabled={isLoading}
              testID="save-button"
            >
              {isLoading ? (
                <ActivityIndicator size={16} color={Colors.primary} />
              ) : (
                <View style={styles.saveButtonContent}>
                  <Check size={16} color={Colors.primary} />
                  <Text style={styles.headerSaveText}>Save</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        }} 
      />
      <View style={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${calculateProgress()}%` }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>Profile {calculateProgress()}% complete</Text>
          {isSaving && <ActivityIndicator size="small" color={Colors.primary} />}
          {!isSaving && lastSaved && (
            <Text style={styles.savedText}>Saved</Text>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: formData.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.cameraButton} 
            onPress={showImagePickerOptions}
            testID="change-photo-button"
          >
            <Camera size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TouchableOpacity 
            style={styles.collapsibleSection}
            onPress={() => toggleSection('basic')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              {expandedSections.basic ? (
                <ChevronUp size={20} color={Colors.textLight} />
              ) : (
                <ChevronDown size={20} color={Colors.textLight} />
              )}
            </View>
          </TouchableOpacity>
          {expandedSections.basic && (
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholder="Enter your full name"
                  testID="name-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Professional Title</Text>
                <TextInput
                  style={styles.input}
                  value={formData.occupation}
                  onChangeText={(value) => updateFormData('occupation', value)}
                  placeholder="e.g., Architecture Student, Professor, Designer"
                  testID="occupation-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>University / Institution</Text>
                <TextInput
                  style={styles.input}
                  value={formData.university}
                  onChangeText={(value) => updateFormData('university', value)}
                  placeholder="Your university"
                  testID="university-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(value) => updateFormData('location', value)}
                  placeholder="City, Country"
                  testID="location-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.helpText}>Share your story and what drives you</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(value) => updateFormData('bio', value)}
                  placeholder="Tell others about yourself..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  testID="bio-input"
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.collapsibleSection}
            onPress={() => toggleSection('expertise')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Expertise & Skills</Text>
              {expandedSections.expertise ? (
                <ChevronUp size={20} color={Colors.textLight} />
              ) : (
                <ChevronDown size={20} color={Colors.textLight} />
              )}
            </View>
          </TouchableOpacity>
          {expandedSections.expertise && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Select your expertise areas</Text>
              <View style={styles.tagsContainer}>
                {COMMON_EXPERTISE_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagChip,
                      formData.expertiseTags.includes(tag) && styles.tagChipSelected,
                    ]}
                    onPress={() => {
                      if (formData.expertiseTags.includes(tag)) {
                        removeExpertiseTag(tag);
                      } else {
                        addExpertiseTag(tag);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        formData.expertiseTags.includes(tag) && styles.tagChipTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.collapsibleSection}
            onPress={() => toggleSection('portfolio')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              {expandedSections.portfolio ? (
                <ChevronUp size={20} color={Colors.textLight} />
              ) : (
                <ChevronDown size={20} color={Colors.textLight} />
              )}
            </View>
          </TouchableOpacity>
          {expandedSections.portfolio && (
            <View style={styles.sectionContent}>
              <Text style={styles.helpText}>Show your best work (up to 10 images)</Text>
              <View style={styles.portfolioGrid}>
                {formData.portfolioImages.map((img: PortfolioImage) => (
                  <View key={img.id} style={styles.portfolioItem}>
                    <Image source={{ uri: img.uri }} style={styles.portfolioImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removePortfolioImage(img.id)}
                    >
                      <X size={16} color={Colors.white} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.captionInput}
                      value={img.caption}
                      onChangeText={(caption) => updatePortfolioCaption(img.id, caption)}
                      placeholder="Add caption..."
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                ))}
                {formData.portfolioImages.length < 10 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={addPortfolioImage}
                  >
                    <Plus size={32} color={Colors.textLight} />
                    <Text style={styles.addImageText}>Add Image</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>External Portfolio Link</Text>
                <TextInput
                  style={styles.input}
                  value={formData.externalPortfolio}
                  onChangeText={(value) => updateFormData('externalPortfolio', value)}
                  placeholder="Behance, Issuu, or personal website"
                  keyboardType="url"
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.collapsibleSection}
            onPress={() => toggleSection('teaching')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Teaching Focus</Text>
              {expandedSections.teaching ? (
                <ChevronUp size={20} color={Colors.textLight} />
              ) : (
                <ChevronDown size={20} color={Colors.textLight} />
              )}
            </View>
          </TouchableOpacity>
          {expandedSections.teaching && (
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>What I can help with</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.teachingFocus}
                  onChangeText={(value) => updateFormData('teachingFocus', value)}
                  placeholder="Describe the areas where you excel..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>How I teach</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.howITeach}
                  onChangeText={(value) => updateFormData('howITeach', value)}
                  placeholder="Your teaching style and approach..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ideal mentees</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.idealMentees}
                  onChangeText={(value) => updateFormData('idealMentees', value)}
                  placeholder="Who would benefit most from your guidance..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.collapsibleSection}
            onPress={() => toggleSection('links')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>External Links</Text>
              {expandedSections.links ? (
                <ChevronUp size={20} color={Colors.textLight} />
              ) : (
                <ChevronDown size={20} color={Colors.textLight} />
              )}
            </View>
          </TouchableOpacity>
          {expandedSections.links && (
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <View style={styles.linkInputHeader}>
                  <Linkedin size={18} color={Colors.textLight} />
                  <Text style={styles.label}>LinkedIn</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.linkedIn}
                  onChangeText={(value) => updateFormData('linkedIn', value)}
                  placeholder="linkedin.com/in/your-profile"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.linkInputHeader}>
                  <Globe size={18} color={Colors.textLight} />
                  <Text style={styles.label}>Website</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.website}
                  onChangeText={(value) => updateFormData('website', value)}
                  placeholder="yourwebsite.com"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.linkInputHeader}>
                  <Instagram size={18} color={Colors.textLight} />
                  <Text style={styles.label}>Instagram</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.instagram}
                  onChangeText={(value) => updateFormData('instagram', value)}
                  placeholder="@yourusername"
                  keyboardType="url"
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.collapsibleSection}
            onPress={() => toggleSection('preferences')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Session Preferences</Text>
              {expandedSections.preferences ? (
                <ChevronUp size={20} color={Colors.textLight} />
              ) : (
                <ChevronDown size={20} color={Colors.textLight} />
              )}
            </View>
          </TouchableOpacity>
          {expandedSections.preferences && (
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Session Types</Text>
                <View style={styles.tagsContainer}>
                  {SESSION_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.tagChip,
                        formData.sessionTypes.includes(type) && styles.tagChipSelected,
                      ]}
                      onPress={() => toggleSessionType(type)}
                    >
                      <Text
                        style={[
                          styles.tagChipText,
                          formData.sessionTypes.includes(type) && styles.tagChipTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Preferred Session Duration</Text>
                <View style={styles.durationContainer}>
                  {SESSION_DURATIONS.map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationButton,
                        formData.preferredDuration === duration && styles.durationButtonSelected,
                      ]}
                      onPress={() => updateFormData('preferredDuration', duration)}
                    >
                      <Text
                        style={[
                          styles.durationButtonText,
                          formData.preferredDuration === duration && styles.durationButtonTextSelected,
                        ]}
                      >
                        {duration}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pricing Tier</Text>
                <Text style={styles.helpText}>General pricing level for your sessions</Text>
                <View style={styles.durationContainer}>
                  {PRICING_TIERS.map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.tierButton,
                        formData.pricingTier === tier && styles.durationButtonSelected,
                      ]}
                      onPress={() => updateFormData('pricingTier', tier)}
                    >
                      <Text
                        style={[
                          styles.durationButtonText,
                          formData.pricingTier === tier && styles.durationButtonTextSelected,
                        ]}
                      >
                        {tier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => setShowPreview(true)}
          >
            <Eye size={20} color={Colors.primary} />
            <Text style={styles.previewButtonText}>Preview Profile</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
        </ScrollView>

        <Modal
          visible={showPreview}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPreview(false)}
        >
          <View style={styles.previewModal}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewHeaderTitle}>Profile Preview</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.previewContent}>
              <View style={styles.previewProfileHeader}>
                <Image
                  source={{ uri: formData.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
                  style={styles.previewProfileImage}
                />
                <Text style={styles.previewName}>{formData.name || 'Your Name'}</Text>
                <Text style={styles.previewTitle}>{formData.occupation || 'Your Title'}</Text>
                <Text style={styles.previewLocation}>{formData.location || 'Location'}</Text>
              </View>

              {formData.expertiseTags.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Expertise</Text>
                  <View style={styles.tagsContainer}>
                    {formData.expertiseTags.map((tag: string) => (
                      <View key={tag} style={styles.previewTag}>
                        <Text style={styles.previewTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {formData.bio && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>About</Text>
                  <Text style={styles.previewText}>{formData.bio}</Text>
                </View>
              )}

              {formData.portfolioImages.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Portfolio</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {formData.portfolioImages.map((img: PortfolioImage) => (
                      <View key={img.id} style={styles.previewPortfolioItem}>
                        <Image source={{ uri: img.uri }} style={styles.previewPortfolioImage} />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 12,
    marginLeft: -4,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackButton: {
    padding: 8,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.border,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 32,
    right: '50%',
    marginRight: -48,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
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
    backgroundColor: Colors.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  headerSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    marginRight: 4,
  },
  headerSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 6,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  savedText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  collapsibleSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tagChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: Colors.white,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  portfolioItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  portfolioImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionInput: {
    height: '25%',
    paddingHorizontal: 8,
    fontSize: 11,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  addImageButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  addImageText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    fontWeight: '500',
  },
  linkInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  durationButtonTextSelected: {
    color: Colors.white,
  },
  tierButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  previewModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  previewHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  previewContent: {
    flex: 1,
  },
  previewProfileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  previewProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 4,
  },
  previewLocation: {
    fontSize: 14,
    color: Colors.textLight,
  },
  previewSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  previewTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
  },
  previewTagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  previewPortfolioItem: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  previewPortfolioImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
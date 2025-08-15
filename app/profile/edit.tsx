import { router, Stack } from 'expo-router';
import { Camera, Check, ArrowLeft } from 'lucide-react-native';
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
  ActivityIndicator,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';


export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: user?.name || '',
    bio: user?.bio || '',
    university: user?.university || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    location: user?.location || '',
    hourlyRate: user?.hourlyRate || 0,
    profileImage: user?.profileImage || '',
  });


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

  const updateFormData = (key: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
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
          title: 'Edit Profile',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButtonHeader}
              onPress={() => router.back()}
              testID="back-button"
            >
              <ArrowLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                style={styles.saveButtonHeader}
                onPress={handleSave}
                disabled={isLoading}
                testID="save-button"
              >
                {isLoading ? (
                  <ActivityIndicator size={16} color={Colors.textLight} />
                ) : (
                  <Check size={20} color={Colors.primary} />
                )}
                {!isLoading && (
                  <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
                    Save
                  </Text>
                )}
                {isLoading && (
                  <Text style={[styles.saveButtonText, styles.saveButtonTextDisabled]}>
                    Saving...
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      <SafeAreaView style={styles.container}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
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
              <Text style={styles.label}>Bio</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>University</Text>
              <TextInput
                style={styles.input}
                value={formData.university}
                onChangeText={(value) => updateFormData('university', value)}
                placeholder="Your university"
                testID="university-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specialization</Text>
              <TextInput
                style={styles.input}
                value={formData.specialization}
                onChangeText={(value) => updateFormData('specialization', value)}
                placeholder="e.g., Sustainable Architecture, Urban Planning"
                testID="specialization-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Experience</Text>
              <TextInput
                style={styles.input}
                value={formData.experience}
                onChangeText={(value) => updateFormData('experience', value)}
                placeholder="e.g., 2 years, Beginner, Expert"
                testID="experience-input"
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Settings</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hourly Rate (USD)</Text>
              <TextInput
                style={styles.input}
                value={formData.hourlyRate?.toString() || ''}
                onChangeText={(value) => updateFormData('hourlyRate', parseInt(value) || 0)}
                placeholder="25"
                keyboardType="numeric"
                testID="hourly-rate-input"
              />
              <Text style={styles.helpText}>This is used as a fallback rate for topics without specific pricing.</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
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
  backButtonHeader: {
    padding: 8,
    marginLeft: -8,
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
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
  headerRightContainer: {
    marginRight: 10,
  },
  saveButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButtonTextDisabled: {
    color: Colors.textLight,
  },
});
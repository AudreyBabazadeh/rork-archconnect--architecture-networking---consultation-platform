import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { X, Star } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useReview } from '@/contexts/ReviewContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';

interface AddReviewModalProps {
  visible: boolean;
  consultantId: string;
  consultantName: string;
  onClose: () => void;
}

export function AddReviewModal({ visible, consultantId, consultantName, onClose }: AddReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [consultationType, setConsultationType] = useState<string>('');
  const { addReview, hasUserReviewedSession } = useReview();
  const { user } = useAuth();
  const { bookingRequests } = useBooking();

  const availableSessions = bookingRequests.filter(
    booking => 
      booking.status === 'accepted' &&
      booking.mentorId === consultantId &&
      booking.studentId === user?.id &&
      new Date(`${booking.date}T${booking.time}`) < new Date() &&
      !hasUserReviewedSession(booking.id)
  );

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to leave a review');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }

    if (!selectedSession) {
      Alert.alert('Session Required', 'Please select a session to review');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment');
      return;
    }

    try {
      await addReview({
        consultantId,
        clientId: user.id,
        clientName: user.name,
        rating,
        comment: comment.trim(),
        consultationType,
        sessionId: selectedSession,
      });

      Alert.alert('Success', 'Your review has been submitted!');
      setRating(0);
      setComment('');
      setSelectedSession('');
      setConsultationType('');
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const handleSessionSelect = (sessionId: string, topic: string) => {
    setSelectedSession(sessionId);
    setConsultationType(topic);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
            <Text style={styles.consultantName}>{consultantName}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Session</Text>
              {availableSessions.length === 0 ? (
                <View style={styles.noSessionsContainer}>
                  <Text style={styles.noSessionsText}>
                    No completed sessions available to review
                  </Text>
                </View>
              ) : (
                <View style={styles.sessionsContainer}>
                  {availableSessions.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      style={[
                        styles.sessionCard,
                        selectedSession === session.id && styles.sessionCardSelected
                      ]}
                      onPress={() => handleSessionSelect(session.id, session.topic)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.sessionInfo}>
                        <Text style={[
                          styles.sessionTopic,
                          selectedSession === session.id && styles.sessionTopicSelected
                        ]}>
                          {session.topic}
                        </Text>
                        <Text style={styles.sessionDate}>
                          {new Date(session.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Text>
                      </View>
                      {selectedSession === session.id && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {availableSessions.length > 0 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Rating</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        activeOpacity={0.7}
                        style={styles.starButton}
                      >
                        <Star
                          size={40}
                          color={star <= rating ? Colors.secondary : Colors.border}
                          fill={star <= rating ? Colors.secondary : 'transparent'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Your Review</Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Share your experience with this session..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={6}
                    value={comment}
                    onChangeText={setComment}
                    textAlignVertical="top"
                  />
                  <Text style={styles.characterCount}>{comment.length} characters</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!rating || !selectedSession || !comment.trim()) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!rating || !selectedSession || !comment.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
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
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  consultantName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sessionsContainer: {
    gap: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sessionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTopic: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sessionTopicSelected: {
    color: Colors.primary,
  },
  sessionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  noSessionsContainer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  noSessionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 140,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

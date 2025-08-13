import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmailService from '../services/emailService';

export default function EmailPreview({ visible, onClose, session }) {
  if (!session) return null;

  const plainTextEmail = EmailService.generatePlainTextEmail(session);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Email Preview</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Email Preview */}
        <ScrollView style={styles.previewContainer}>
          <View style={styles.emailCard}>
            <View style={styles.emailHeader}>
              <Text style={styles.emailSubject}>
                📧 Subject: Session Confirmed: {session.mentorName} - {session.date} at {session.time}
              </Text>
            </View>

            <View style={styles.emailBody}>
              <Text style={styles.emailContent}>{plainTextEmail}</Text>
            </View>

            <View style={styles.emailFooter}>
              <Text style={styles.footerNote}>
                💡 This email will be sent to both you and your mentor
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.closeActionButton} onPress={onClose}>
            <Text style={styles.closeActionText}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  emailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
    marginBottom: 20,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  emailBody: {
    marginBottom: 20,
  },
  emailContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    fontFamily: 'monospace',
  },
  emailFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  footerNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  closeActionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  closeActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SessionRequestCard = ({ 
  request, 
  onAccept, 
  onDecline, 
  onViewDetails,
  isProcessing = false 
}) => {
  return (
    <View style={styles.requestCard}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={onViewDetails}
      >
        <View style={styles.cardHeader}>
          <View style={styles.menteeInfo}>
            <Ionicons name="person-circle" size={46} color="#667eea" />
            <View style={styles.menteeDetails}>
              <Text style={styles.menteeName}>{request.mentee.name}</Text>
              <Text style={styles.menteeTitle}>{request.mentee.title || 'Mentee'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#ff9800' }]}>
            <Ionicons name="time" size={16} color="white" />
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>

        <View style={styles.sessionInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{request.requestedDate} at {request.requestedTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{request.duration} minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="book-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{request.topic}</Text>
          </View>
          {request.fee > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{request.fee} MMK</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => onAccept(request)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => onDecline(request)}
          disabled={isProcessing}
        >
          <Ionicons name="close-circle" size={20} color="white" />
          <Text style={styles.actionButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menteeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menteeDetails: {
    marginLeft: 12,
  },
  menteeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menteeTitle: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sessionInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SessionRequestCard;

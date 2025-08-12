import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VideoCallService from '../services/videoCallService';

export default function VideoCallButton({ session, style, onPress }) {
  if (!session.hasVideoCall || !session.videoCall) {
    return null;
  }

  const buttonStatus = VideoCallService.getJoinButtonStatus(session);
  
  if (!buttonStatus) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress(session.videoCall);
    } else {
      VideoCallService.joinCall(session.videoCall);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonStatus.color },
        buttonStatus.urgent && styles.urgentButton,
        style,
      ]}
      onPress={handlePress}
    >
      <View style={styles.buttonContent}>
        <Ionicons 
          name="videocam" 
          size={20} 
          color="white" 
          style={styles.icon}
        />
        <Text style={styles.buttonText}>{buttonStatus.text}</Text>
        {buttonStatus.urgent && (
          <View style={styles.pulse}>
            <View style={styles.pulseCircle} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  urgentButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pulse: {
    position: 'absolute',
    right: -5,
    top: -5,
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
    opacity: 0.8,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestAuthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Auth Screen - If you see this, the screen is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    margin: 20,
  },
});

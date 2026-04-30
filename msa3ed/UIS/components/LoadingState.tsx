import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/Colors';
import Animated, { FadeIn } from 'react-native-reanimated';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'جاري التحميل...' }: LoadingStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  spinnerContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    boxShadow: [{ color: 'rgba(99, 102, 241, 0.1)', offsetX: 0, offsetY: 10, blurRadius: 20, spreadDistance: 0 }],
    elevation: 5,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

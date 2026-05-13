import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const Skeleton = ({ width, height, borderRadius = 8, style }: any) => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[{ width, height, borderRadius, backgroundColor: '#2a2a4e', opacity }, style]} />
  );
};

export default Skeleton;

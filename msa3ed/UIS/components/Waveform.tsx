import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

interface WaveformProps {
  peaks: number[];
  progress?: number; // 0 to 1
  color?: string;
  height?: number;
}

export default function Waveform({ peaks, progress = 0, color = Colors.primary, height = 40 }: WaveformProps) {
  return (
    <View style={[styles.container, { height }]}>
      {peaks.map((peak, index) => {
        const isPlayed = (index / peaks.length) <= progress;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: `${peak}%`,
                backgroundColor: isPlayed ? color : color + '40',
                width: 2,
                marginHorizontal: 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bar: {
    borderRadius: 1,
  },
});

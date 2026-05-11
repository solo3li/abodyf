import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../../services/api';

interface AudioPlayerWidgetProps {
  url: string;
  isSender: boolean;
}

export default function AudioPlayerWidget({ url, isSender }: AudioPlayerWidgetProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const getFullUrl = (u: string) => u.startsWith('http') ? u : API_BASE_URL + u;

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const loadSound = async () => {
    const { sound: newSound, status } = await Audio.Sound.createAsync(
      { uri: getFullUrl(url) },
      { progressUpdateIntervalMillis: 100 },
      (stat) => {
        if (stat.isLoaded) {
          setDuration(stat.durationMillis || 0);
          setPosition(stat.positionMillis || 0);
          setIsPlaying(stat.isPlaying);
          if (stat.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      }
    );
    setSound(newSound);
    return newSound;
  };

  const handlePlayPause = async () => {
    if (!sound) {
      const newSound = await loadSound();
      await newSound.playAsync();
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      if (position >= duration && duration > 0) {
        await sound.replayAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: isSender ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }]}>
      <Pressable style={styles.playBtn} onPress={handlePlayPause}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={isSender ? Colors.white : Colors.primary} />
      </Pressable>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: isSender ? 'rgba(255,255,255,0.4)' : Colors.border }]}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: isSender ? Colors.white : Colors.primary }]} />
        </View>
        <Text style={[styles.timeText, { color: isSender ? Colors.white : Colors.textSecondary }]}>
          {formatTime(position)} / {duration > 0 ? formatTime(duration) : '--:--'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 24, width: 220, gap: 12 },
  playBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  progressContainer: { flex: 1, justifyContent: 'center', gap: 4 },
  progressBarBg: { height: 4, borderRadius: 2, width: '100%' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  timeText: { fontSize: 10, fontWeight: '500', textAlign: 'left' }
});
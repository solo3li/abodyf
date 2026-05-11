import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState(-160);
  const [durationMillis, setDurationMillis] = useState(0);

  useEffect(() => {
    startRecording();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('تسجيل الصوت غير مدعوم في هذا المتصفح أو البيئة.');
        onCancel();
        return;
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setMetering(status.metering || -160);
            setDurationMillis(status.durationMillis);
          }
        },
        100 // update interval
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start recording', err);
      alert('تعذر بدء التسجيل: ' + (err.message || 'خطأ غير معروف'));
      onCancel();
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        onRecordingComplete(uri, durationMillis);
      } else {
        onCancel();
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      onCancel();
    }
    setRecording(null);
  };

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Simple visualizer mapping metering (-160 to 0) to scale
  const scale = Math.max(0.1, (metering + 160) / 160);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: withSpring(scale * 2.5) }],
      opacity: withSpring(0.5 + scale * 0.5)
    };
  });

  return (
    <View style={styles.container}>
      <Pressable onPress={onCancel} style={styles.cancelBtn}>
        <Ionicons name="trash-outline" size={24} color={Colors.error} />
      </Pressable>

      <View style={styles.visualizerContainer}>
        {Array.from({ length: 15 }).map((_, i) => (
          <Animated.View 
            key={i} 
            style={[
              styles.bar, 
              animatedStyle, 
              { height: 10 + Math.random() * 20 }
            ]} 
          />
        ))}
      </View>

      <Text style={styles.duration}>{formatDuration(durationMillis)}</Text>

      <Pressable onPress={stopRecording} style={styles.stopBtn}>
        <Ionicons name="stop" size={24} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    gap: 12
  },
  cancelBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  visualizerContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 40 },
  bar: { width: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  duration: { fontSize: 16, fontWeight: 'bold', color: Colors.text, width: 45, textAlign: 'center' },
  stopBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }
});
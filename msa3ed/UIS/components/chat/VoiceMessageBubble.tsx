import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, I18nManager,
  Image, Animated, ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { ChatMessage } from '../../store/slices/chatSlice';
import Waveform from '../Waveform';

// Feature 013 T024: VoiceMessageBubble with waveform + animated playback progress + duration
// RTL-aware, shows upload status for optimistic messages

interface Props {
  message: ChatMessage;
  isOwn: boolean;
}

export const VoiceMessageBubble: React.FC<Props> = ({ message, isOwn }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPos, setPlaybackPos] = useState(0); // 0-1
  const progressAnim = useRef(new Animated.Value(0)).current;
  const isRTL = I18nManager.isRTL;

  const togglePlay = async () => {
    if (isPlaying && sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }

    const audioUrl = message.attachments?.[0]?.url;
    if (!audioUrl) return;

    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    const { sound: s } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true },
      (status) => {
        if (!status.isLoaded) return;
        const pos = status.durationMillis
          ? status.positionMillis / status.durationMillis
          : 0;
        setPlaybackPos(pos);
        Animated.timing(progressAnim, {
          toValue: pos,
          duration: 100,
          useNativeDriver: false,
        }).start();
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPlaybackPos(0);
          progressAnim.setValue(0);
        }
      }
    );
    setSound(s);
    setIsPlaying(true);
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bubbleStyle = [
    styles.bubble,
    isOwn ? styles.ownBubble : styles.otherBubble,
    isRTL && styles.rtlBubble,
  ];

  if (message.uploadStatus === 'uploading') {
    return (
      <View style={bubbleStyle}>
        <ActivityIndicator size="small" color="#6c63ff" />
        <Text style={styles.uploadingText}>جارٍ الإرسال...</Text>
      </View>
    );
  }

  if (message.uploadStatus === 'failed') {
    return (
      <View style={bubbleStyle}>
        <Text style={styles.failedText}>فشل الإرسال</Text>
      </View>
    );
  }

  return (
    <View style={bubbleStyle}>
      <View style={[styles.row, isRTL && styles.rtlRow]}>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={togglePlay}
          accessibilityLabel={isPlaying ? 'pause-voice' : 'play-voice'}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <View style={styles.waveContainer}>
          <Waveform
            data={message.waveformData ?? []}
            progress={playbackPos}
            color={isOwn ? '#ffffff80' : '#6c63ff80'}
            progressColor={isOwn ? '#ffffff' : '#6c63ff'}
          />
          <Text style={[styles.duration, isOwn && styles.durationOwn]}>
            {formatDuration(message.voiceDurationSeconds)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 10,
    marginVertical: 2,
  },
  ownBubble: {
    backgroundColor: '#6c63ff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1e1e3f',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  rtlBubble: {
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rtlRow: { flexDirection: 'row-reverse' },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  playBtnActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  playIcon: { fontSize: 14, color: '#fff' },
  waveContainer: { flex: 1 },
  duration: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  durationOwn: { color: 'rgba(255,255,255,0.85)' },
  uploadingText: { color: '#a0a0b0', fontSize: 12, marginTop: 4 },
  failedText: { color: '#ff4d4d', fontSize: 12 },
});

export default VoiceMessageBubble;

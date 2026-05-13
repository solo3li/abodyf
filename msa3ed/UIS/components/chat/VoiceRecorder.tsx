import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, TouchableOpacity, StyleSheet, Text, I18nManager, Animated, Platform
} from 'react-native';
import { Audio } from 'expo-av';
import { useDispatch, useSelector } from 'react-redux';
import {
  startRecording, pauseRecording, resumeRecording,
  finishRecording, discardRecording, addWaveformPeak, tickDuration
} from '../../store/slices/chatSlice';

// Feature 013 T023: VoiceRecorder with live waveform, pause-on-interrupt, preview panel
// Supports RTL layout via I18nManager.isRTL

const MAX_BARS = 40;
const METER_INTERVAL_MS = 100;

interface VoiceRecorderProps {
  onSend: (audioUri: string, waveformPeaks: number[], durationSeconds: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const dispatch = useDispatch();
  const voice = useSelector((s: any) => s.chat.voice);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const meterTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for recording indicator
  useEffect(() => {
    if (voice.isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voice.isRecording]);

  const startRec = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.metering != null) {
            // Normalize from dBFS (-160 to 0) to 0-100
            const normalized = Math.max(0, Math.min(100, Math.round((status.metering + 160) * 0.625)));
            dispatch(addWaveformPeak(normalized));
          }
        },
        METER_INTERVAL_MS
      );
      setRecording(rec);
      dispatch(startRecording());
      durationTimer.current = setInterval(() => dispatch(tickDuration()), 1000);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const pauseRec = async () => {
    if (!recording) return;
    await recording.pauseAsync();
    dispatch(pauseRecording());
    if (durationTimer.current) clearInterval(durationTimer.current);
  };

  const resumeRec = async () => {
    if (!recording) return;
    await recording.startAsync();
    dispatch(resumeRecording());
    durationTimer.current = setInterval(() => dispatch(tickDuration()), 1000);
  };

  const stopAndPreview = async () => {
    if (!recording) return;
    if (durationTimer.current) clearInterval(durationTimer.current);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) {
      dispatch(finishRecording({ localAudioUri: uri }));
    }
  };

  const discard = async () => {
    if (sound) { await sound.unloadAsync(); setSound(null); }
    if (recording) {
      try { await recording.stopAndUnloadAsync(); } catch (_) {}
    }
    setRecording(null);
    dispatch(discardRecording());
    if (durationTimer.current) clearInterval(durationTimer.current);
    onCancel();
  };

  const playPreview = async () => {
    if (!voice.localAudioUri) return;
    if (sound) { await sound.replayAsync(); return; }
    const { sound: s } = await Audio.Sound.createAsync(
      { uri: voice.localAudioUri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
      }
    );
    setSound(s);
    setIsPlaying(true);
  };

  const sendVoice = () => {
    if (sound) sound.unloadAsync();
    onSend(voice.localAudioUri!, voice.waveformPeaks, voice.durationSeconds);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isRTL = I18nManager.isRTL;

  // Preview mode
  if (voice.isPreview) {
    return (
      <View style={[styles.container, isRTL && styles.rtl]}>
        <View style={styles.waveformRow}>
          {voice.waveformPeaks.slice(-MAX_BARS).map((peak, i) => (
            <View
              key={i}
              style={[styles.bar, { height: Math.max(4, (peak / 100) * 40) }]}
            />
          ))}
        </View>
        <Text style={styles.duration}>{formatDuration(voice.durationSeconds)}</Text>
        <View style={[styles.previewActions, isRTL && styles.rtl]}>
          <TouchableOpacity style={styles.discardBtn} onPress={discard} accessibilityLabel="discard-voice">
            <Text style={styles.discardText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={playPreview} accessibilityLabel="play-preview">
            <Text style={styles.playText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} onPress={sendVoice} accessibilityLabel="send-voice">
            <Text style={styles.sendText}>إرسال</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Recording mode
  return (
    <View style={[styles.container, isRTL && styles.rtl]}>
      <View style={styles.waveformRow}>
        {voice.waveformPeaks.slice(-MAX_BARS).map((peak, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              { height: Math.max(4, (peak / 100) * 40) },
              i === voice.waveformPeaks.length - 1 && voice.isRecording
                ? { transform: [{ scaleY: pulseAnim }] }
                : {},
            ]}
          />
        ))}
      </View>

      <Text style={styles.duration}>{formatDuration(voice.durationSeconds)}</Text>

      <View style={[styles.controls, isRTL && styles.rtl]}>
        <TouchableOpacity style={styles.discardBtn} onPress={discard} accessibilityLabel="cancel-recording">
          <Text style={styles.discardText}>✕</Text>
        </TouchableOpacity>

        {!voice.isRecording && !voice.isPaused ? (
          <TouchableOpacity style={styles.micBtn} onPress={startRec} accessibilityLabel="start-recording">
            <Text style={{ fontSize: 24 }}>🎤</Text>
          </TouchableOpacity>
        ) : voice.isRecording ? (
          <>
            <TouchableOpacity style={styles.pauseBtn} onPress={pauseRec} accessibilityLabel="pause-recording">
              <Text style={styles.playText}>⏸</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopBtn} onPress={stopAndPreview} accessibilityLabel="stop-recording">
              <View style={styles.stopIcon} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.pauseBtn} onPress={resumeRec} accessibilityLabel="resume-recording">
              <Text style={styles.playText}>▶</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopBtn} onPress={stopAndPreview} accessibilityLabel="stop-recording">
              <View style={styles.stopIcon} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#1a1a2e', borderRadius: 16 },
  rtl: { flexDirection: 'row-reverse' },
  waveformRow: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    height: 48, marginBottom: 8,
  },
  bar: { width: 3, borderRadius: 2, backgroundColor: '#6c63ff' },
  duration: { color: '#a0a0b0', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  previewActions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  micBtn: { padding: 12, backgroundColor: '#6c63ff', borderRadius: 30 },
  pauseBtn: { padding: 10, backgroundColor: '#2a2a4e', borderRadius: 24 },
  stopBtn: { padding: 10, backgroundColor: '#e74c3c33', borderRadius: 24 },
  stopIcon: { width: 14, height: 14, borderRadius: 2, backgroundColor: '#e74c3c' },
  discardBtn: { padding: 10, backgroundColor: '#ff4d4d22', borderRadius: 24 },
  discardText: { color: '#ff4d4d', fontSize: 16 },
  playBtn: { padding: 10, backgroundColor: '#6c63ff33', borderRadius: 24 },
  playText: { fontSize: 16, color: '#6c63ff' },
  sendBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#6c63ff', borderRadius: 20,
  },
  sendText: { color: '#fff', fontWeight: '600' },
});

export default VoiceRecorder;

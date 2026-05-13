import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, I18nManager } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { VoiceRecorder } from '../../../../components/chat/VoiceRecorder';

// Feature 013 T026: ChatInput with text, image, doc, and VoiceRecorder integration (RTL-aware)

interface ChatInputProps {
  onSend: (payload: { content?: string; attachments?: any[]; audioFile?: any; waveformData?: number[] }) => Promise<void>;
  sending: boolean;
  extraButtons?: React.ReactNode;
}

export default function ChatInput({ onSend, sending, extraButtons }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const isRTL = I18nManager.isRTL;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], // T026: support video
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const files = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || (asset.type === 'video' ? 'video.mp4' : 'image.jpg'),
        type: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
      }));
      await onSend({ attachments: files });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (!result.canceled) {
      const files = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.name || 'document',
        type: asset.mimeType || 'application/octet-stream',
      }));
      await onSend({ attachments: files });
    }
  };

  const handleSendText = async () => {
    if (inputText.trim()) {
      await onSend({ content: inputText });
      setInputText('');
    }
  };

  const handleVoiceSend = async (audioUri: string, waveformPeaks: number[], durationSeconds: number) => {
    setIsVoiceMode(false);
    const audioFile = {
      uri: audioUri,
      name: 'voice_message.m4a',
      type: 'audio/m4a'
    };
    await onSend({ audioFile, waveformData: waveformPeaks });
  };

  if (isVoiceMode) {
    return (
      <View style={[styles.inputContainer, styles.voiceModeContainer]}>
        <VoiceRecorder 
          onSend={handleVoiceSend}
          onCancel={() => setIsVoiceMode(false)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.inputContainer, isRTL && styles.rtlContainer]}>
      {extraButtons}
      <TouchableOpacity style={styles.attachBtn} onPress={pickDocument} disabled={sending}>
        <Ionicons name="document-attach" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.attachBtn} onPress={pickImage} disabled={sending}>
        <Ionicons name="image" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>
      
      {!inputText.trim() ? (
        <TouchableOpacity style={styles.attachBtn} onPress={() => setIsVoiceMode(true)} disabled={sending}>
          <Ionicons name="mic" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      ) : null}

      <TextInput 
        style={[styles.input, isRTL && styles.rtlInput]} 
        placeholder="اكتب رسالتك هنا..." 
        placeholderTextColor={Colors.textSecondary}
        multiline
        value={inputText}
        onChangeText={setInputText}
        editable={!sending}
      />
      
      {inputText.trim() ? (
        <TouchableOpacity style={[styles.sendBtn, isRTL && styles.rtlSendBtn]} onPress={handleSendText} disabled={sending}>
          {sending ? <ActivityIndicator size="small" color={Colors.white} /> : <Ionicons name="send" size={20} color={Colors.white} />}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 12, paddingBottom: 24, 
    backgroundColor: '#1a1a2e', 
    borderTopWidth: 1, borderTopColor: '#2a2a4e', 
    minHeight: 76 
  },
  rtlContainer: { flexDirection: 'row-reverse' },
  voiceModeContainer: { paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'center' },
  attachBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  input: { 
    flex: 1, minHeight: 40, maxHeight: 100, 
    backgroundColor: '#0f0f1f', borderRadius: 20, 
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, 
    fontSize: 15, color: '#fff', 
    marginHorizontal: 8 
  },
  rtlInput: { textAlign: 'right' },
  sendBtn: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#6c63ff', 
    justifyContent: 'center', alignItems: 'center',
    marginRight: 4
  },
  rtlSendBtn: { marginRight: 0, marginLeft: 4, transform: [{ scaleX: -1 }] }, // flip icon for RTL
});

import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AudioRecorder from './AudioRecorder';

interface ChatInputProps {
  onSend: (content?: string, attachments?: any[], audioFile?: any) => Promise<void>;
  sending: boolean;
  extraButtons?: React.ReactNode;
}

export default function ChatInput({ onSend, sending, extraButtons }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const [isRecordingMode, setIsRecordingMode] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const files = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || 'chat_upload.jpg',
        type: asset.mimeType || 'image/jpeg',
      }));
      await onSend('', files);
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
      await onSend('', files);
    }
  };

  const handleSendText = async () => {
    if (inputText.trim()) {
      await onSend(inputText);
      setInputText('');
    }
  };

  const handleRecordingComplete = async (uri: string, durationMillis: number) => {
    setIsRecordingMode(false);
    const audioFile = {
      uri,
      name: 'voice_message.m4a',
      type: 'audio/m4a'
    };
    await onSend('', [], audioFile);
  };

  if (isRecordingMode) {
    return (
      <View style={styles.inputContainer}>
        <AudioRecorder 
          onRecordingComplete={handleRecordingComplete} 
          onCancel={() => setIsRecordingMode(false)} 
        />
      </View>
    );
  }

  return (
    <View style={styles.inputContainer}>
      {extraButtons}
      <Pressable style={styles.attachBtn} onPress={pickDocument} disabled={sending}>
        <Ionicons name="document-attach" size={24} color={Colors.textSecondary} />
      </Pressable>
      <Pressable style={styles.attachBtn} onPress={pickImage} disabled={sending}>
        <Ionicons name="image" size={24} color={Colors.textSecondary} />
      </Pressable>
      <Pressable style={styles.attachBtn} onPress={() => setIsRecordingMode(true)} disabled={sending}>
        <Ionicons name="mic" size={24} color={Colors.textSecondary} />
      </Pressable>
      <TextInput 
        style={styles.input} 
        placeholder="اكتب رسالتك هنا..." 
        placeholderTextColor={Colors.textSecondary}
        multiline
        value={inputText}
        onChangeText={setInputText}
        editable={!sending}
      />
      <Pressable style={styles.sendBtn} onPress={handleSendText} disabled={sending || !inputText.trim()}>
        {sending ? <ActivityIndicator size="small" color={Colors.white} /> : <Ionicons name="send" size={20} color={Colors.white} style={{ marginLeft: 4 }} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 32, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, minHeight: 76 },
  attachBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, minHeight: 44, maxHeight: 100, backgroundColor: Colors.background, borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: Colors.text, textAlign: 'right', marginHorizontal: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
});

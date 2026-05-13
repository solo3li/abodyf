import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Linking } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../../services/api';
import CustomOfferWidget from './CustomOfferWidget';
import AudioPlayerWidget from './AudioPlayerWidget';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    attachments?: any[];
    waveformData?: number[];
    sentAt: string | Date;
    customOffer?: any;
  };
  isSender: boolean;
}

export default function MessageBubble({ message, isSender }: MessageBubbleProps) {
  const getFullUrl = (url: string) => url.startsWith('http') ? url : API_BASE_URL + url;

  const handleOpenDocument = (url: string) => {
    Linking.openURL(getFullUrl(url));
  };

  const renderAttachment = (att: any, index: number) => {
    const type = att.fileType?.toLowerCase() || '';
    
    if (type === 'image') {
      return (
        <Image key={index} source={{ uri: getFullUrl(att.url) }} style={styles.messageImage} resizeMode="cover" />
      );
    }

    if (type === 'audio') {
      return (
        <View key={index} style={{ marginTop: 8 }}>
          <AudioPlayerWidget url={att.url} waveformData={message.waveformData} isSender={isSender} />
        </View>
      );
    }

    if (type === 'document' || type === 'file') {
      return (
        <Pressable key={index} style={styles.fileContainer} onPress={() => handleOpenDocument(att.url)}>
          <Ionicons name="document" size={24} color={isSender ? Colors.white : Colors.primary} />
          <Text style={[styles.fileText, { color: isSender ? Colors.white : Colors.text }]} numberOfLines={1}>
            {att.fileName || 'مستند مرفق'}
          </Text>
          <Ionicons name="download-outline" size={20} color={isSender ? Colors.white : Colors.primary} />
        </Pressable>
      );
    }

    return null;
  };

  return (
    <View style={[styles.messageBubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
      {!isSender && <Text style={styles.senderName}>{message.senderName || 'الطرف الآخر'}</Text>}
      
      {message.customOffer ? (
        <CustomOfferWidget offer={message.customOffer} />
      ) : (
        <>
          {message.content ? <Text style={[styles.messageText, isSender ? styles.senderText : styles.receiverText]}>{message.content}</Text> : null}
          
          <View style={styles.attachmentsContainer}>
            {message.attachments?.map((att, idx) => renderAttachment(att, idx))}
          </View>
        </>
      )}

      <Text style={[styles.timeText, isSender ? styles.senderTime : styles.receiverTime]}>
          {new Date(message.sentAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: { 
    maxWidth: '80%', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    shadowColor: 'rgba(30, 41, 59, 0.08)', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 8, 
    shadowOpacity: 1, 
    elevation: 2 
  },
  senderBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: Colors.primary, 
    borderBottomLeftRadius: 4 
  },
  receiverBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: Colors.surface, 
    borderBottomRightRadius: 4, 
    borderWidth: 1, 
    borderColor: Colors.border 
  },
  senderName: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 6, textAlign: 'left' },
  messageText: { fontSize: 16, lineHeight: 24, textAlign: 'left' },
  senderText: { color: Colors.surface },
  receiverText: { color: Colors.text },
  attachmentsContainer: { marginTop: 8 },
  messageImage: { width: 220, height: 220, borderRadius: 12, marginTop: 8, backgroundColor: Colors.border },
  fileContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12, padding: 12, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12 },
  fileText: { fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'left' },
  timeText: { fontSize: 11, marginTop: 10, alignSelf: 'flex-end', fontWeight: '500' },
  senderTime: { color: 'rgba(255,255,255,0.8)' },
  receiverTime: { color: Colors.textSecondary },
});

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
    attachmentUrl?: string;
    attachmentType?: string;
    sentAt: string | Date;
    customOffer?: any;
  };
  isSender: boolean;
}

export default function MessageBubble({ message, isSender }: MessageBubbleProps) {
  const getFullUrl = (url: string) => url.startsWith('http') ? url : API_BASE_URL + url;

  const handleOpenDocument = () => {
    if (message.attachmentUrl) {
      Linking.openURL(getFullUrl(message.attachmentUrl));
    }
  };

  return (
    <View style={[styles.messageBubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
      {!isSender && <Text style={styles.senderName}>{message.senderName || 'الطرف الآخر'}</Text>}
      
      {message.customOffer ? (
        <CustomOfferWidget offer={message.customOffer} />
      ) : (
        <>
          {message.content ? <Text style={[styles.messageText, isSender ? styles.senderText : styles.receiverText]}>{message.content}</Text> : null}
          
          {message.attachmentUrl && message.attachmentType === 'image' && (
              <Image source={{ uri: getFullUrl(message.attachmentUrl) }} style={styles.messageImage} resizeMode="cover" />
          )}

          {message.attachmentUrl && message.attachmentType === 'audio' && (
              <View style={{ marginTop: message.content ? 8 : 0 }}>
                  <AudioPlayerWidget url={message.attachmentUrl} isSender={isSender} />
              </View>
          )}

          {message.attachmentUrl && message.attachmentType === 'document' && (
              <Pressable style={styles.fileContainer} onPress={handleOpenDocument}>
                  <Ionicons name="document" size={24} color={isSender ? Colors.white : Colors.primary} />
                  <Text style={[styles.fileText, { color: isSender ? Colors.white : Colors.text }]} numberOfLines={1}>مستند مرفق</Text>
                  <Ionicons name="download-outline" size={20} color={isSender ? Colors.white : Colors.primary} />
              </Pressable>
          )}

          {message.attachmentUrl && (!['image', 'document', 'audio'].includes(message.attachmentType || '')) && (
              <Pressable style={styles.fileContainer} onPress={handleOpenDocument}>
                  <Ionicons name="document-attach" size={24} color={isSender ? Colors.white : Colors.primary} />
                  <Text style={[styles.fileText, { color: isSender ? Colors.white : Colors.text }]} numberOfLines={1}>ملف مرفق</Text>
              </Pressable>
          )}
        </>
      )}

      <Text style={[styles.timeText, isSender ? styles.senderTime : styles.receiverTime]}>
          {new Date(message.sentAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: { maxWidth: '85%', padding: 16, borderRadius: 20, marginBottom: 12, shadowColor: 'rgba(0, 0, 0, 0.03)', shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, shadowOpacity: 1, elevation: 1 },
  senderBubble: { alignSelf: 'flex-start', backgroundColor: Colors.primary, borderBottomLeftRadius: 4 },
  receiverBubble: { alignSelf: 'flex-end', backgroundColor: Colors.white, borderBottomRightRadius: 4, borderWidth: 1, borderColor: Colors.border },
  senderName: { fontSize: 12, fontWeight: 'bold', color: Colors.primary, marginBottom: 4, textAlign: 'left' },
  messageText: { fontSize: 16, lineHeight: 24, textAlign: 'left' },
  senderText: { color: Colors.white },
  receiverText: { color: Colors.text },
  messageImage: { width: 220, height: 220, borderRadius: 12, marginTop: 8 },
  fileContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8, padding: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10 },
  fileText: { fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'left' },
  timeText: { fontSize: 10, marginTop: 8, alignSelf: 'flex-end', fontWeight: '600' },
  senderTime: { color: 'rgba(255,255,255,0.7)' },
  receiverTime: { color: Colors.textSecondary },
});

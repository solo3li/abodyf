import React from 'react';
import {
  View, Text, StyleSheet, I18nManager
} from 'react-native';
import { ChatMessage } from '../../store/slices/chatSlice';
import VoiceMessageBubble from './VoiceMessageBubble';
import MediaMessageBubble from './MediaMessageBubble';

// Feature 013 T025: MessageBubble routing to Voice/Media/Text based on message.type

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  onRetry?: () => void;
  /** Admin mode: show moderation toolbar */
  showModerationTools?: boolean;
  onDelete?: () => void;
  onFlag?: () => void;
}

export const MessageBubble: React.FC<Props> = ({
  message, isOwn, onRetry, showModerationTools, onDelete, onFlag
}) => {
  const isRTL = I18nManager.isRTL;

  // Soft-deleted message placeholder
  if (message.isDeleted) {
    return (
      <View style={[styles.deletedBubble, isOwn ? styles.ownAlign : styles.otherAlign]}>
        <Text style={styles.deletedText}>[تم حذف الرسالة]</Text>
      </View>
    );
  }

  // Route to specialized bubble by type
  if (message.type === 'Voice') {
    return <VoiceMessageBubble message={message} isOwn={isOwn} />;
  }

  if (['Image', 'Video', 'File'].includes(message.type)) {
    return <MediaMessageBubble message={message} isOwn={isOwn} onRetry={onRetry} />;
  }

  // Text bubble
  const bubbleStyle = [
    styles.bubble,
    isOwn ? styles.ownBubble : styles.otherBubble,
    isRTL && (isOwn ? styles.rtlOwn : styles.rtlOther),
  ];

  return (
    <View style={[styles.wrapper, isOwn ? styles.ownAlign : styles.otherAlign]}>
      <View style={bubbleStyle}>
        <Text style={[styles.content, isRTL && styles.rtlText]}>{message.content}</Text>
        <Text style={styles.time}>
          {new Date(message.sentAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginVertical: 2 },
  ownAlign: { alignSelf: 'flex-end' },
  otherAlign: { alignSelf: 'flex-start' },
  bubble: {
    maxWidth: '75%', borderRadius: 16, padding: 10,
  },
  ownBubble: {
    backgroundColor: '#6c63ff', borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1e1e3f', borderBottomLeftRadius: 4,
  },
  rtlOwn: { borderBottomRightRadius: 16, borderBottomLeftRadius: 4 },
  rtlOther: { borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  content: { color: '#fff', fontSize: 15, lineHeight: 22 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  time: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  deletedBubble: {
    maxWidth: '65%', padding: 8, borderRadius: 12,
    backgroundColor: '#1e1e3f', borderWidth: 1, borderColor: '#2a2a4e',
    borderStyle: 'dashed',
  },
  deletedText: { color: '#555577', fontSize: 13, fontStyle: 'italic' },
});

export default MessageBubble;

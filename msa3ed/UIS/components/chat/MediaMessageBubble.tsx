import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  I18nManager, Linking, ActivityIndicator,
} from 'react-native';
import { ChatMessage } from '../../store/slices/chatSlice';

// Feature 013 T032: MediaMessageBubble for Image/Video/File + RetryUploadButton — RTL-aware

interface Props {
  message: ChatMessage;
  isOwn: boolean;
  onRetry?: () => void;
}

export const MediaMessageBubble: React.FC<Props> = ({ message, isOwn, onRetry }) => {
  const isRTL = I18nManager.isRTL;
  const att = message.attachments?.[0];

  const bubbleStyle = [
    styles.bubble,
    isOwn ? styles.ownBubble : styles.otherBubble,
    isRTL && (isOwn ? styles.rtlOwn : styles.rtlOther),
  ];

  if (message.uploadStatus === 'uploading') {
    return (
      <View style={bubbleStyle}>
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#6c63ff" />
          <Text style={styles.uploadingText}>جارٍ الرفع...</Text>
        </View>
      </View>
    );
  }

  if (message.uploadStatus === 'failed') {
    return (
      <View style={bubbleStyle}>
        <Text style={styles.failedText}>❌ فشل الإرسال</Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRetry}
            accessibilityLabel="retry-upload"
          >
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (message.type === 'Image') {
    return (
      <View style={bubbleStyle}>
        <TouchableOpacity onPress={() => att?.url && Linking.openURL(att.url)}>
          <Image
            source={{ uri: att?.thumbnailUrl ?? att?.url }}
            style={styles.imagePreview}
            resizeMode="cover"
            accessibilityLabel="image-attachment"
          />
        </TouchableOpacity>
        {message.content ? <Text style={styles.caption}>{message.content}</Text> : null}
      </View>
    );
  }

  if (message.type === 'Video') {
    return (
      <View style={bubbleStyle}>
        <TouchableOpacity
          style={styles.videoContainer}
          onPress={() => att?.url && Linking.openURL(att.url)}
          accessibilityLabel="video-attachment"
        >
          {att?.thumbnailUrl ? (
            <Image source={{ uri: att.thumbnailUrl }} style={styles.imagePreview} resizeMode="cover" />
          ) : (
            <View style={[styles.imagePreview, styles.videoPlaceholder]}>
              <Text style={styles.videoIcon}>🎥</Text>
            </View>
          )}
          <View style={styles.playOverlay}>
            <Text style={styles.playOverlayIcon}>▶</Text>
          </View>
          {att?.durationSeconds != null && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>
                {Math.floor(att.durationSeconds / 60)}:{(att.durationSeconds % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {message.content ? <Text style={styles.caption}>{message.content}</Text> : null}
      </View>
    );
  }

  // File type
  return (
    <View style={bubbleStyle}>
      <TouchableOpacity
        style={[styles.fileRow, isRTL && styles.rtlRow]}
        onPress={() => att?.url && Linking.openURL(att.url)}
        accessibilityLabel="file-attachment"
      >
        <Text style={styles.fileIcon}>📎</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.fileName} numberOfLines={1}>{att?.fileName ?? 'ملف'}</Text>
          <Text style={styles.fileSize}>
            {att?.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : ''}
          </Text>
        </View>
        <Text style={styles.downloadIcon}>⬇</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    overflow: 'hidden',
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
  rtlOwn: { borderBottomRightRadius: 16, borderBottomLeftRadius: 4 },
  rtlOther: { borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  imagePreview: { width: 220, height: 160, borderRadius: 12 },
  videoContainer: { position: 'relative' },
  videoPlaceholder: { backgroundColor: '#0d0d1a', justifyContent: 'center', alignItems: 'center' },
  videoIcon: { fontSize: 40 },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  playOverlayIcon: {
    fontSize: 32, color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 30, padding: 10,
  },
  durationBadge: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  durationBadgeText: { color: '#fff', fontSize: 11 },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: 13, padding: 8 },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12,
  },
  rtlRow: { flexDirection: 'row-reverse' },
  fileIcon: { fontSize: 24 },
  fileName: { color: '#fff', fontSize: 13, fontWeight: '500' },
  fileSize: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  downloadIcon: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  uploadingOverlay: {
    padding: 20, alignItems: 'center', minWidth: 120,
    backgroundColor: '#1e1e3f', borderRadius: 16,
  },
  uploadingText: { color: '#a0a0b0', marginTop: 8, fontSize: 12 },
  failedText: { color: '#ff4d4d', padding: 12, fontSize: 13 },
  retryBtn: {
    margin: 8, marginTop: 0, paddingVertical: 6, paddingHorizontal: 16,
    backgroundColor: '#6c63ff33', borderRadius: 12,
  },
  retryText: { color: '#6c63ff', fontSize: 13, fontWeight: '600' },
});

export default MediaMessageBubble;

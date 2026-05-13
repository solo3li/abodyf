import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, I18nManager
} from 'react-native';
import { InboxItem } from '../../store/slices/chatSlice';

// Feature 013 T057: InboxRow with avatar, contactName, media-type label, unread badge, timestamp — RTL-aware

interface Props {
  item: InboxItem;
  onPress: () => void;
}

const MediaLabel: Record<string, string> = {
  Voice: '🎤 رسالة صوتية',
  Image: '📷 صورة',
  Video: '🎥 فيديو',
  File: '📎 ملف',
  Text: '',
};

export const InboxRow: React.FC<Props> = ({ item, onPress }) => {
  const isRTL = I18nManager.isRTL;

  const timeLabel = item.lastMessageAt
    ? new Date(item.lastMessageAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    : '';

  const preview = MediaLabel[item.lastMessageType] || item.lastMessagePreview;

  return (
    <TouchableOpacity
      style={[styles.row, isRTL && styles.rtlRow]}
      onPress={onPress}
      accessibilityLabel={`inbox-row-${item.chatId}`}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.contactAvatar ? (
          <Image source={{ uri: item.contactAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{item.contactName?.charAt(0) ?? '?'}</Text>
          </View>
        )}
        {item.unreadCount > 0 && (
          <View style={styles.onlineDot} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.content, isRTL && styles.rtlContent]}>
        <View style={[styles.topRow, isRTL && styles.rtlRow]}>
          <Text style={[styles.name, item.unreadCount > 0 && styles.nameBold]} numberOfLines={1}>
            {item.contactName}
          </Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        <View style={[styles.bottomRow, isRTL && styles.rtlRow]}>
          <Text
            style={[styles.preview, item.unreadCount > 0 && styles.previewBold]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f0f1f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  rtlRow: { flexDirection: 'row-reverse' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 20, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#2ecc71', borderWidth: 2, borderColor: '#0f0f1f',
  },
  content: { flex: 1 },
  rtlContent: { alignItems: 'flex-end' },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 3,
  },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#e0e0f0', fontSize: 15 },
  nameBold: { fontWeight: '700' },
  time: { color: '#555577', fontSize: 11 },
  preview: { color: '#6c6c90', fontSize: 13, flex: 1, marginRight: 8 },
  previewBold: { color: '#9999bb', fontWeight: '600' },
  badge: {
    backgroundColor: '#6c63ff',
    borderRadius: 10, minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

export default InboxRow;

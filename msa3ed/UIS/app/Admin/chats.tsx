import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, I18nManager } from 'react-native';
import { apiFetch } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../../components/EmptyState';

// Feature 013 T049/T050: Admin Chat Moderation
export default function AdminChatsScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const isRTL = I18nManager.isRTL;

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/Admin/Conversations');
      setConversations(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleMute = async (userId: string, userName: string) => {
    Alert.prompt(`كتم المستخدم: ${userName}`, 'مدة الكتم (بالدقائق):', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'كتم', style: 'destructive', onPress: async (duration: string | undefined) => {
        const mins = parseInt(duration || '60');
        if (isNaN(mins) || mins <= 0) return Alert.alert('خطأ', 'يرجى إدخال مدة صحيحة');
        
        setActionLoading(userId);
        try {
          await apiFetch(`/Admin/Users/${userId}/Mute`, {
            method: 'POST',
            body: JSON.stringify({ durationMinutes: mins, notes: 'Admin UI mute action' })
          });
          Alert.alert('نجاح', `تم كتم ${userName} لمدة ${mins} دقيقة`);
        } catch (e: any) {
          Alert.alert('خطأ', e.message);
        } finally {
          setActionLoading(null);
        }
      }}
    ], 'plain-text', '60');
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.cardHeader, isRTL && styles.rtlRow]}>
        <Ionicons name="chatbubbles" size={24} color="#6c63ff" />
        <View style={{ flex: 1, marginHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text style={styles.title}>محادثة {item.type === 'Private' ? 'خاصة' : 'طلب'} #{item.chatId.substring(0,6)}</Text>
          <Text style={styles.messageCount}>{item.messageCount} رسالة</Text>
        </View>
      </View>
      
      <View style={styles.lastMessageArea}>
        <Text style={[styles.lastMessageLabel, isRTL && styles.rtlText]}>آخر رسالة:</Text>
        <Text style={[styles.lastMessagePreview, isRTL && styles.rtlText]} numberOfLines={2}>
          {item.lastMessage?.preview || 'لا يوجد'}
        </Text>
        {item.lastMessage?.sentAt && (
          <Text style={[styles.time, isRTL && styles.rtlText]}>
            {new Date(item.lastMessage.sentAt).toLocaleString('ar-EG')}
          </Text>
        )}
      </View>

      <View style={styles.participantsArea}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>المشاركين (إجراءات الرقابة):</Text>
        {item.participants?.map((p: any) => (
          <View key={p.userId} style={[styles.participantRow, isRTL && styles.rtlRow]}>
            <View style={[styles.pInfo, isRTL && styles.rtlRow]}>
              <Ionicons name="person-circle" size={20} color="#a0a0b0" />
              <Text style={styles.pName}>{p.name} ({p.role === 'Student' ? 'طالب' : 'منفذ'})</Text>
            </View>
            <TouchableOpacity 
              style={styles.muteBtn} 
              onPress={() => handleMute(p.userId, p.name)}
              disabled={!!actionLoading}
            >
              {actionLoading === p.userId ? (
                <ActivityIndicator size="small" color="#ff4d4d" />
              ) : (
                <Text style={styles.muteText}>كتم</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <Text style={styles.headerTitle}>رقابة المحادثات</Text>
      </View>
      {loading ? (
        <ActivityIndicator color="#6c63ff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.chatId}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="chatbubble-ellipses-outline" title="لا توجد محادثات" description="لم يتم العثور على أي محادثات في النظام" />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#1a1a2e', borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  rtlRow: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right' },
  list: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a4e', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0f0f1f', borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  messageCount: { fontSize: 12, color: '#6c6c90', marginTop: 2 },
  lastMessageArea: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  lastMessageLabel: { fontSize: 12, color: '#a0a0b0', marginBottom: 4 },
  lastMessagePreview: { fontSize: 14, color: '#e0e0f0', lineHeight: 20 },
  time: { fontSize: 11, color: '#6c6c90', marginTop: 8 },
  participantsArea: { padding: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  participantRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pName: { fontSize: 14, color: '#e0e0f0' },
  muteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#ff4d4d11', borderWidth: 1, borderColor: '#ff4d4d55' },
  muteText: { color: '#ff4d4d', fontSize: 12, fontWeight: '600' },
});

import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/Notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/Notifications/MarkRead/${id}`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/Notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)}>
      <Pressable 
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.isRead ? Colors.border : Colors.primary + '15' }]}>
          <Ionicons 
            name={item.isRead ? "notifications-outline" : "notifications"} 
            size={24} 
            color={item.isRead ? Colors.textSecondary : Colors.primary} 
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.message, !item.isRead && styles.unreadMessage]}>{item.message}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('ar-EG')}</Text>
        </View>
        <Pressable style={styles.deleteBtn} onPress={() => deleteNotification(item.id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={80} color={Colors.border} />
              <Text style={styles.emptyText}>لا توجد إشعارات حالياً</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  list: { padding: 16 },
  notificationCard: { flexDirection: 'row', backgroundColor: Colors.white, padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', elevation: 1 },
  unreadCard: { backgroundColor: Colors.primary + '05', borderWidth: 1, borderColor: Colors.primary + '20' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1, marginRight: 12 },
  message: { fontSize: 15, color: Colors.text, lineHeight: 22, textAlign: 'right' },
  unreadMessage: { fontWeight: 'bold' },
  date: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
  deleteBtn: { padding: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
});

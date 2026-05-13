import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, I18nManager } from 'react-native';
import { apiFetch } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../../components/EmptyState';

// Feature 013 T039/T040: Admin Service Approval Queue
export default function AdminServicesScreen() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const isRTL = I18nManager.isRTL;

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/Admin/Services/Pending');
      setServices(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await apiFetch(`/Admin/Services/${id}/Approve`, { method: 'PUT', body: JSON.stringify({}) });
      setServices(prev => prev.filter(s => s.id !== id));
      Alert.alert('نجاح', 'تمت الموافقة على الخدمة');
    } catch (e: any) {
      Alert.alert('خطأ', e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    Alert.prompt('سبب الرفض', 'اكتب سبب رفض الخدمة (اختياري)', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'رفض', style: 'destructive', onPress: async (reason: string | undefined) => {
        setActionLoading(id);
        try {
          await apiFetch(`/Admin/Services/${id}/Reject`, { 
            method: 'PUT', 
            body: JSON.stringify({ reason }) 
          });
          setServices(prev => prev.filter(s => s.id !== id));
          Alert.alert('نجاح', 'تم رفض الخدمة');
        } catch (e: any) {
          Alert.alert('خطأ', e.message);
        } finally {
          setActionLoading(null);
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.cardHeader, isRTL && styles.rtlRow]}>
        <Image source={{ uri: item.imageUrl || 'https://placehold.co/150' }} style={styles.image} />
        <View style={[styles.info, isRTL && styles.rtlInfo]}>
          <Text style={[styles.title, isRTL && styles.rtlText]}>{item.title}</Text>
          <Text style={[styles.sub, isRTL && styles.rtlText]}>{item.category?.name} {item.subCategory ? `> ${item.subCategory.name}` : ''}</Text>
          <Text style={[styles.price, isRTL && styles.rtlText]}>{item.basePrice} ر.س</Text>
        </View>
      </View>
      <View style={[styles.executorInfo, isRTL && styles.rtlRow]}>
        <Ionicons name="person-circle-outline" size={20} color="#6c6c90" />
        <Text style={styles.executorText}>{item.executor?.name}</Text>
        <Ionicons name="time-outline" size={16} color="#6c6c90" style={{ marginLeft: 8 }} />
        <Text style={styles.executorText}>{new Date(item.submittedAt).toLocaleDateString('ar-EG')}</Text>
      </View>
      
      <View style={[styles.actions, isRTL && styles.rtlRow]}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)} disabled={!!actionLoading}>
          <Text style={styles.rejectText}>رفض</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)} disabled={!!actionLoading}>
          {actionLoading === item.id ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.approveText}>موافقة</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <Text style={styles.headerTitle}>طلبات الخدمات المعلقة</Text>
      </View>
      {loading ? (
        <ActivityIndicator color="#6c63ff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="checkmark-done-circle-outline" title="لا توجد طلبات معلقة" description="جميع الخدمات تمت مراجعتها" />}
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
  list: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a4e' },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  image: { width: 80, height: 80, borderRadius: 12 },
  info: { flex: 1, justifyContent: 'center' },
  rtlInfo: { alignItems: 'flex-end' },
  rtlText: { textAlign: 'right' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6c6c90', marginBottom: 4 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71' },
  executorInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#2a2a4e' },
  executorText: { fontSize: 12, color: '#a0a0b0' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  rejectBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#ff4d4d22', alignItems: 'center', borderWidth: 1, borderColor: '#ff4d4d' },
  rejectText: { color: '#ff4d4d', fontWeight: 'bold' },
  approveBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#6c63ff', alignItems: 'center' },
  approveText: { color: '#fff', fontWeight: 'bold' },
});

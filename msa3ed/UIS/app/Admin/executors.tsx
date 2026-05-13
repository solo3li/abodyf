import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator, I18nManager } from 'react-native';
import { apiFetch } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../../components/EmptyState';
import SearchBar from '../../components/SearchBar';

// Feature 013 T066: Admin Executor Management with Search/Filter
export default function AdminExecutorsScreen() {
  const [executors, setExecutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const isRTL = I18nManager.isRTL;

  const loadExecutors = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/Admin/Executors?name=${encodeURIComponent(search)}`);
      setExecutors(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExecutors();
  }, [search]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.cardHeader, isRTL && styles.rtlRow]}>
        <Image source={{ uri: item.avatar || 'https://placehold.co/150' }} style={styles.avatar} />
        <View style={[styles.info, isRTL && styles.rtlInfo]}>
          <Text style={[styles.name, isRTL && styles.rtlText]}>{item.name}</Text>
          <Text style={[styles.sub, isRTL && styles.rtlText]}>{item.specialty || 'بدون تخصص'} • {item.email}</Text>
          <View style={[styles.statsRow, isRTL && styles.rtlRow]}>
            <Ionicons name="star" size={14} color="#f1c40f" />
            <Text style={styles.statText}>{parseFloat(item.rating || '0').toFixed(1)}</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>{item.completedOrdersCount} طلب مكتمل</Text>
          </View>
        </View>
      </View>
      <View style={[styles.metrics, isRTL && styles.rtlRow]}>
        <View style={styles.metricBox}>
          <Text style={styles.metricVal}>{item.activeServicesCount}</Text>
          <Text style={styles.metricLabel}>نشطة</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={[styles.metricVal, item.pendingServicesCount > 0 && { color: '#f39c12' }]}>
            {item.pendingServicesCount}
          </Text>
          <Text style={styles.metricLabel}>معلقة</Text>
        </View>
        <View style={[styles.metricBox, { borderLeftWidth: 0, borderRightWidth: 0 }]}>
          <Text style={[styles.metricVal, { color: item.isActive ? '#2ecc71' : '#ff4d4d' }]}>
            {item.isActive ? 'نشط' : 'موقوف'}
          </Text>
          <Text style={styles.metricLabel}>الحالة</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <Text style={styles.headerTitle}>إدارة المنفذين</Text>
      </View>
      <View style={styles.searchWrap}>
        <SearchBar value={search} onSearch={setSearch} />
      </View>
      {loading ? (
        <ActivityIndicator color="#6c63ff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={executors}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="people-outline" title="لم نجد منفذين" description="حاول استخدام كلمة بحث أخرى" />}
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
  searchWrap: { padding: 24, paddingBottom: 0 },
  list: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a4e', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', gap: 12, padding: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  info: { flex: 1, justifyContent: 'center' },
  rtlInfo: { alignItems: 'flex-end' },
  rtlText: { textAlign: 'right' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6c6c90', marginBottom: 6 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#a0a0b0', fontWeight: '500' },
  statDot: { color: '#6c6c90', fontSize: 12, marginHorizontal: 4 },
  metrics: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2a2a4e', backgroundColor: '#0f0f1f' },
  metricBox: { flex: 1, paddingVertical: 12, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#2a2a4e' },
  metricVal: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  metricLabel: { fontSize: 11, color: '#6c6c90' },
});

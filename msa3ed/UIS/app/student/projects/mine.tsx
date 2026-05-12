import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../../services/api';

export default function MyProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await apiFetch('/Projects/Mine');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return Colors.success;
      case 'Closed': return Colors.textSecondary;
      default: return Colors.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'Open': return 'مفتوح لتلقي العروض';
      case 'Closed': return 'مغلق';
      default: return status;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable style={styles.card} onPress={() => router.push(`/student/projects/${item.id}/offers` as any)}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <Ionicons name="pricetag-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{item.categoryName}</Text>
        </View>
        <View style={styles.metaInfo}>
          <Ionicons name="wallet-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{item.budget} ج.م</Text>
        </View>
        <View style={[styles.metaInfo, { backgroundColor: Colors.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }]}>
          <Ionicons name="documents-outline" size={14} color={Colors.primary} />
          <Text style={[styles.metaText, { color: Colors.primary, fontWeight: 'bold' }]}>{item.offersCount} عرض</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>مشاريعي الخاصة</Text>
        <Pressable onPress={() => router.push('/student/projects/create' as any)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="documents-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>لم تقم بإضافة أي مشاريع خاصة بعد</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  list: { padding: 24, gap: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, elevation: 2, boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 8, spreadDistance: 0 }] },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 12, color: Colors.textSecondary },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.text, textAlign: 'right', marginBottom: 16 },
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  metaInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
});

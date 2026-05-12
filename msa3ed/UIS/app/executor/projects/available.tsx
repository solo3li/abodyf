import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../../services/api';

export default function AvailableProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await apiFetch('/Projects/Open');
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

  const renderItem = ({ item }: { item: any }) => (
    <Pressable style={styles.card} onPress={() => router.push(`/executor/projects/${item.id}` as any)}>
      <View style={styles.cardHeader}>
        <View style={styles.userBadge}>
          <Ionicons name="person-circle-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.userName}>{item.studentName}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <Ionicons name="pricetag-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{item.categoryName}</Text>
        </View>
        <View style={styles.budgetBadge}>
          <Ionicons name="wallet" size={16} color={Colors.success} />
          <Text style={styles.budgetText}>{item.budget} ج.م</Text>
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
        <Text style={styles.pageTitle}>مشاريع متاحة</Text>
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
              <Ionicons name="briefcase-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>لا توجد مشاريع متاحة حالياً</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  list: { padding: 24, gap: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, elevation: 2, boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 8, spreadDistance: 0 }] },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  userName: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  date: { fontSize: 12, color: Colors.textSecondary },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.text, textAlign: 'right', marginBottom: 8 },
  description: { fontSize: 14, color: Colors.textSecondary, textAlign: 'right', marginBottom: 16, lineHeight: 22 },
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 },
  metaInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  budgetBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: Colors.success + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  budgetText: { fontSize: 14, fontWeight: 'bold', color: Colors.success },
  empty: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
});

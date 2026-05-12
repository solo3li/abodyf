import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchExecutorServices } from '../../../store/slices/servicesSlice';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../../../components/EmptyState';
import LoadingState from '../../../components/LoadingState';
import { API_BASE_URL } from '../../../services/api';

const getApiUrl = (path: string) => path ? (path.startsWith('http') ? path : API_BASE_URL + path) : 'https://placehold.co/300x168';

export default function ExecutorServicesScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const servicesState = useSelector((state: RootState) => state.services);
  const executorServices = servicesState?.executorServices || [];
  const loading = servicesState?.loading || false;

  useEffect(() => {
    dispatch(fetchExecutorServices());
  }, [dispatch]);

  const renderItem = ({ item }: any) => (
    <Pressable style={styles.card} onPress={() => router.push(`/executor/services/${item.id}`)}>
      <Image source={{ uri: getApiUrl(item.imageUrl) }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{item.basePrice} ج.م</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return Colors.success;
      case 'PendingApproval': return Colors.warning;
      case 'Rejected': return Colors.error;
      case 'Paused': return Colors.textSecondary;
      default: return Colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>خدماتي</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push('/executor/services/create')}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={executorServices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState 
              icon="briefcase-outline" 
              title="لا توجد خدمات بعد" 
              description="ابدأ بإضافة خدمتك الأولى الآن لجذب العملاء."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { marginRight: 16 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: Colors.text },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24 },
  card: { backgroundColor: Colors.white, borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2 },
  image: { width: '100%', height: 140 },
  content: { padding: 16 },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: Colors.white },
});

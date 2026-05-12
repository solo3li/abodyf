import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch, API_BASE_URL } from '../../../../services/api';
import Button from '../../../../components/Button';

export default function ProjectOffersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const data = await apiFetch(`/Projects/${id}`);
      setProject(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await apiFetch(`/Projects/Offers/${offerId}/Accept`, { method: 'POST' });
      alert('تم قبول العرض وتحويله لطلب عمل بنجاح');
      router.replace(`/shared/order/${response.orderId}` as any);
    } catch (err: any) {
      alert('فشل في قبول العرض: ' + err.message);
    }
  };

  const handleNegotiate = async (executorId: string) => {
    try {
      const chat = await apiFetch('/Chat/Private/Initiate', { 
        method: 'POST',
        body: JSON.stringify({ executorId }),
        headers: { 'Content-Type': 'application/json' }
      });
      router.push(`/shared/chat/${chat.id}` as any);
    } catch (err) {
      alert('فشل في بدء المحادثة');
    }
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />;
  if (!project) return <View style={styles.empty}><Text>لم يتم العثور على المشروع</Text></View>;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.executorInfo}>
          <Image source={{ uri: item.executor?.profilePicture || 'https://ui-avatars.com/api/?name=U' }} style={styles.avatar} />
          <View>
            <Text style={styles.executorName}>{item.executor?.fullName}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={Colors.warning} />
              <Text style={styles.ratingText}>{item.executor?.rating}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.coverLetter}>{item.coverLetter}</Text>
      
      <View style={styles.offerDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>السعر المقترح</Text>
          <Text style={styles.detailValue}>{item.proposedPrice} ج.م</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>مدة التنفيذ</Text>
          <Text style={styles.detailValue}>{item.proposedDays} أيام</Text>
        </View>
      </View>

      {project.status === 'Open' && item.status === 'Pending' && (
        <View style={styles.actions}>
          <Button 
            title="تحدث مع المنفذ" 
            onPress={() => handleNegotiate(item.executor.id)} 
            style={{ flex: 1, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.primary }} 
            icon="chatbubbles-outline"
          />
          <Button 
            title="قبول العرض" 
            onPress={() => handleAcceptOffer(item.id)} 
            style={{ flex: 1 }} 
            icon="checkmark-circle-outline"
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>عروض المشروع</Text>
      </View>

      <FlatList
        data={project.offers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectStatus}>الحالة: {project.status === 'Open' ? 'مفتوح' : 'مغلق'}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyText}>لم يتم تقديم أي عروض بعد</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  list: { padding: 24, gap: 16 },
  projectInfo: { marginBottom: 16, alignItems: 'flex-end' },
  projectTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, textAlign: 'right' },
  projectStatus: { fontSize: 14, color: Colors.primary, marginTop: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, elevation: 2, boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 8, spreadDistance: 0 }] },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  executorInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  executorName: { fontSize: 14, fontWeight: 'bold', color: Colors.text, textAlign: 'right' },
  rating: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary },
  statusBadge: { backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, color: Colors.textSecondary, fontWeight: 'bold' },
  coverLetter: { fontSize: 14, color: Colors.textSecondary, textAlign: 'right', lineHeight: 22, marginBottom: 16 },
  offerDetails: { flexDirection: 'row-reverse', backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginBottom: 16, justifyContent: 'space-around' },
  detailItem: { alignItems: 'center' },
  detailLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  detailDivider: { width: 1, height: '100%', backgroundColor: Colors.border },
  actions: { flexDirection: 'row-reverse', gap: 12 },
  empty: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
});

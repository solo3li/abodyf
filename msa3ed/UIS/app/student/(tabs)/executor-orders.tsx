import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect } from 'react';
import { fetchAvailableOrders } from '../../../store/slices/ordersSlice';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

export default function AvailableOrdersScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { availableOrders, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchAvailableOrders());
  }, [dispatch]);

  const renderItem = ({ item, index }: any) => {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
          
          <Text style={styles.serviceTitle}>{item.serviceName || item.serviceTitle}</Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.studentName || item.customerName}</Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.deadline || item.createdAt}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.price}>{item.totalPrice || item.price} ج.م</Text>
            <Pressable style={styles.acceptBtn} onPress={() => router.push(`/shared/order/${item.id}`)}>
              <Text style={styles.acceptBtnText}>{item.status === 'متاح' || item.status === 'Available' ? 'قبول الطلب' : 'متابعة'}</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>الطلبات المتاحة (منفذ)</Text>
        <View style={styles.backBtn} />
      </View>

      {loading && availableOrders.length === 0 ? (
        <LoadingState message="جاري البحث عن طلبات متاحة..." />
      ) : (
        <FlatList
          data={availableOrders}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState 
              icon="briefcase-outline" 
              title="لا توجد طلبات متاحة حالياً" 
              description="يرجى العودة لاحقاً، سنقوم بإشعارك عند توفر طلبات جديدة تناسب تخصصك." 
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: Colors.white, boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }], elevation: 2, zIndex: 10 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.text },
  list: { padding: 24 },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: [{ color: 'rgba(0,0,0,0.03)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }], elevation: 2, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: Colors.textSecondary },
  badge: { backgroundColor: Colors.success + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: Colors.success, fontSize: 12, fontWeight: 'bold' },
  serviceTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  detail: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 14, color: Colors.textSecondary, marginLeft: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border, borderStyle: 'dashed' },
  price: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  acceptBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  acceptBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 14 },
});

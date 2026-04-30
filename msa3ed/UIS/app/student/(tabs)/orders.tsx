import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect } from 'react';
import { fetchMyOrders } from '../../../store/slices/ordersSlice';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import { API_BASE_URL } from '../../../services/api';

export default function OrdersScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { myOrders, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'قيد التنفيذ':
      case 'In Progress':
        return Colors.warning;
      case 'مكتمل':
      case 'Completed':
        return Colors.success;
      case 'ملغي':
      case 'Cancelled':
        return Colors.error;
      case 'بانتظار الرد':
      case 'Pending':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'قيد التنفيذ':
      case 'In Progress': return 'time';
      case 'مكتمل':
      case 'Completed': return 'checkmark-circle';
      case 'ملغي':
      case 'Cancelled': return 'close-circle';
      case 'بانتظار الرد':
      case 'Pending': return 'hourglass';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const getApiUrl = (path: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600';
    return path.startsWith('http') ? path : API_BASE_URL + path;
  };

  const renderItem = ({ item, index }: any) => {
    const statusColor = getStatusColor(item.status);
    return (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <Pressable style={styles.orderCard} onPress={() => router.push(`/shared/order/${item.id}`)}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Ionicons name="receipt-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Ionicons name={getStatusIcon(item.status) as any} size={14} color={statusColor} style={{ marginLeft: 4 }} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
          </View>
          
          <View style={styles.serviceInfoRow}>
            <Image source={{ uri: getApiUrl(item.serviceImageUrl) }} style={styles.serviceThumb} />
            <Text style={styles.serviceTitle} numberOfLines={2}>{item.serviceName || item.serviceTitle}</Text>
          </View>
          
          <View style={styles.orderFooter}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.dateText}>{formatDate(item.createdAt || item.date)}</Text>
            </View>
            <Text style={styles.price}>{item.totalPrice || item.price} ج.م</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>طلباتي</Text>
      </View>
      {loading && myOrders.length === 0 ? (
        <LoadingState message="جاري تحميل الطلبات..." />
      ) : (
        <FlatList
          data={myOrders}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="document-text-outline" 
              title="لا توجد طلبات حالياً" 
              description="لم تقم بطلب أي خدمة بعد. تصفح الخدمات المتاحة واطلب ما تحتاجه." 
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.white,
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 10, spreadDistance: 0 }],
    elevation: 2,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  list: {
    padding: 24,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    boxShadow: [{ color: 'rgba(0,0,0,0.04)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderId: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  serviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  serviceThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderStyle: 'dashed',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
});

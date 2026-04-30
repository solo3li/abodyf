import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Colors } from '../../../constants/Colors';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect } from 'react';
import { fetchMyOrders } from '../../../store/slices/ordersSlice';
import { API_BASE_URL } from '../../../services/api';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

const getApiUrl = (path: string) => path ? (path.startsWith('http') ? path : API_BASE_URL + path) : 'https://placehold.co/150';

export default function ChatScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { myOrders, loading } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  // Derive chats from orders
  const chats = myOrders.map((order: any) => {
    const isStudent = user?.id === order.studentId;
    const otherName = isStudent ? (order.executorName || 'منصة UIS') : (order.studentName || 'طالب');
    
    return {
      id: order.id,
      name: otherName,
      avatar: 'https://i.pravatar.cc/150?u=' + (isStudent ? order.executorId : order.studentId),
      lastMessage: 'تواصل بخصوص ' + (order.serviceTitle || ''),
      time: order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : 'الآن',
      unread: 0,
      online: false,
    };
  });

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInLeft.delay(index * 100)}>
      <Pressable style={styles.chatCard} onPress={() => router.push(`/shared/chat/${item.id}`)}>
        <View>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.online && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={[styles.time, item.unread > 0 && styles.timeUnread]}>{item.time}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={[styles.lastMessage, item.unread > 0 && styles.lastMessageUnread]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unread > 0 && (
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.unreadBadge}
              >
                <Text style={styles.unreadText}>{item.unread}</Text>
              </LinearGradient>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الرسائل</Text>
      </View>
      {loading && chats.length === 0 ? (
        <LoadingState message="جاري تحميل الرسائل..." />
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="chatbubbles-outline" 
              title="لا توجد محادثات" 
              description="ستظهر هنا محادثاتك مع المنفذين بخصوص الطلبات الخاصة بك." 
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
  chatCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(0,0,0,0.03)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 16,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  timeUnread: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 16,
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

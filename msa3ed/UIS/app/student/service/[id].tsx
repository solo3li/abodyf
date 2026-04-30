import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect } from 'react';
import { fetchServiceById } from '../../../store/slices/catalogSlice';
import { API_BASE_URL } from '../../../services/api';

const { width } = Dimensions.get('window');

const getApiUrl = (path: string) => path ? (path.startsWith('http') ? path : API_BASE_URL + path) : 'https://placehold.co/150';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentService, loading } = useSelector((state: RootState) => state.catalog);
  const service = currentService as any;

  useEffect(() => {
    if (id) {
      dispatch(fetchServiceById(id as string));
    }
  }, [id, dispatch]);

  if (loading || !service) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: getApiUrl(service.imageUrl || service.image) }} 
            style={styles.image} 
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-forward-outline" size={24} color={Colors.text} />
          </Pressable>
          <View style={styles.imageContent}>
            <Text style={styles.categoryBadge}>{service.categoryName || service.category}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <View style={styles.header}>
              <Text style={styles.title}>{service.name || service.title}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={18} color={Colors.warning} />
                <Text style={styles.ratingText}>{service.rating || '4.5'}</Text>
                <Text style={styles.reviewsText}>({service.reviews || 0} تقييم)</Text>
              </View>
            </View>

            <Text style={styles.price}>{service.basePrice || service.price} ج.م</Text>

            <View style={styles.providerCard}>
              <Image source={{ uri: getApiUrl(service.providerAvatarUrl) }} style={styles.providerAvatar} />
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{service.providerName || 'منصة UIS'}</Text>
                <Text style={styles.providerLevel}>بائع مميز موثوق</Text>
              </View>
              <Pressable style={styles.chatBtn}>
                <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>نظرة عامة على الخدمة</Text>
              <Text style={styles.description}>
                {service.description}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="time" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.detailTitle}>مدة التسليم</Text>
                <Text style={styles.detailValue}>{service.deliveryTime || 'يومان'}</Text>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.detailIconContainer, { backgroundColor: Colors.accent + '15' }]}>
                  <Ionicons name="sync" size={24} color={Colors.accent} />
                </View>
                <Text style={styles.detailTitle}>مرات التعديل</Text>
                <Text style={styles.detailValue}>3 مرات</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => router.push(`/student/checkout?serviceId=${service.id}`)} style={{ flex: 1 }}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.orderBtn}
          >
            <Text style={styles.orderBtnText}>اطلب الخدمة الآن</Text>
            <Ionicons name="cart" size={20} color={Colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    width: '100%',
    height: 350,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContent: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    color: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 36,
    marginBottom: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 6,
  },
  reviewsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 24,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  providerLevel: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  chatBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailItem: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 8,
    boxShadow: [{ color: 'rgba(0,0,0,0.03)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  orderBtn: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: [{ color: 'rgba(99, 102, 241, 0.3)', offsetX: 0, offsetY: 8, blurRadius: 15, spreadDistance: 0 }],
    elevation: 8,
  },
  orderBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
});

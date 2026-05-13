import { View, Text, StyleSheet, ScrollView, Pressable, Image, Dimensions, RefreshControl, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCategories, fetchServices } from '../../../store/slices/catalogSlice';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL, apiFetch } from '../../../services/api';
import SearchBar from '../../../components/SearchBar';
import CategoryList from '../../../components/CategoryList';
import Skeleton from '../../../components/Skeleton';

// Feature 013 T072-T074: Home Screen with Live Data, Skeletons, Pull-to-Refresh

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, services, loading } = useSelector((state: RootState) => state.catalog);
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const isRTL = I18nManager.isRTL;

  // Additional Data
  const [executors, setExecutors] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  const loadData = useCallback(async () => {
    dispatch(fetchCategories());
    dispatch(fetchServices({ searchTerm, category: selectedCategoryId }));
    
    setLoadingExtras(true);
    try {
      const [exRes, offRes] = await Promise.all([
        apiFetch('/Admin/Executors'),
        apiFetch('/Offer')
      ]);
      setExecutors(exRes.items?.slice(0, 5) || []);
      setOffers(offRes?.slice(0, 5) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExtras(false);
    }
  }, [dispatch, searchTerm, selectedCategoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSelectCategory = (id: string) => {
    const newId = selectedCategoryId === id ? undefined : id;
    setSelectedCategoryId(newId);
    dispatch(fetchServices({ searchTerm, category: newId }));
  };

  const getApiUrl = (path: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600';
    return path.startsWith('http') ? path : API_BASE_URL + path;
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c63ff" />}
    >
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={['#1a1a2e', '#0d0d1a']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={[styles.headerTop, isRTL && styles.rtlRow]}>
            <View style={isRTL ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
              <Text style={styles.greeting}>مرحباً، {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'أحمد'} 👋</Text>
              <Text style={styles.subtitle}>ماذا تحتاج اليوم؟</Text>
            </View>
            <Pressable style={styles.notificationBtn} onPress={() => router.push('/Admin/Notifications' as any)}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.badge} />
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <Pressable onPress={() => router.push('/student/search' as any)}>
        <View pointerEvents="none" style={{ paddingHorizontal: 16 }}>
          <SearchBar onSearch={() => {}} value="" />
        </View>
      </Pressable>

      <View style={styles.content}>
        <CategoryList 
          categories={categories} 
          selectedCategoryId={selectedCategoryId} 
          onSelectCategory={handleSelectCategory} 
        />

        {/* Top Executors */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
            <Text style={styles.sectionTitle}>منفذين متميزين</Text>
            <Pressable onPress={() => router.push({ pathname: '/student/search' as any, params: { tab: 'executors' } })}>
              <Text style={styles.seeAll}>الكل</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.horizontalList, isRTL && styles.rtlRow]}>
            {loadingExtras ? (
              [1, 2, 3].map(i => (
                <View key={i} style={styles.executorCard}>
                  <Skeleton width={60} height={60} borderRadius={30} style={{ marginBottom: 12 }} />
                  <Skeleton width={80} height={12} />
                </View>
              ))
            ) : (
              executors.map((ex, i) => (
                <Pressable key={ex.id} style={styles.executorCard} onPress={() => router.push(`/student/profile/${ex.id}`)}>
                  <Image source={{ uri: ex.avatar || 'https://placehold.co/150' }} style={styles.executorAvatar} />
                  <Text style={styles.executorName} numberOfLines={1}>{ex.name}</Text>
                  <Text style={styles.executorStats}>{parseFloat(ex.rating || '0').toFixed(1)} ⭐</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Popular Services */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
            <Text style={styles.sectionTitle}>خدمات مقترحة</Text>
            <Pressable onPress={() => router.push({ pathname: '/student/search' as any, params: { tab: 'services' } })}>
              <Text style={styles.seeAll}>الكل</Text>
            </Pressable>
          </View>
          
          <View style={[styles.servicesGrid, isRTL && styles.rtlRow]}>
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <View key={i} style={styles.serviceCardWrapper}>
                  <View style={styles.serviceCard}>
                    <Skeleton width="100%" height={120} borderRadius={0} />
                    <View style={styles.serviceContent}>
                      <Skeleton width="90%" height={14} style={{ marginBottom: 8 }} />
                      <Skeleton width="60%" height={14} style={{ marginBottom: 16 }} />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Skeleton width={40} height={12} />
                        <Skeleton width={40} height={12} />
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : services.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#6c6c90" />
                <Text style={styles.emptyText}>لم نجد خدمات تطابق بحثك</Text>
              </View>
            ) : (
              services.map((service: any, index: number) => (
                <Animated.View key={service.id} entering={FadeInDown.delay(index * 50).springify()} style={styles.serviceCardWrapper}>
                  <Pressable style={styles.serviceCard} onPress={() => router.push(`/student/service/${service.id}`)}>
                    <Image source={{ uri: getApiUrl(service.imageUrl) }} style={styles.serviceImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.imageOverlay}>
                      <Text style={styles.categoryTag}>{service.category?.name || service.categoryName}</Text>
                    </LinearGradient>
                    <View style={styles.serviceContent}>
                      <Text style={[styles.serviceTitle, isRTL && { textAlign: 'right' }]} numberOfLines={2}>{service.title}</Text>
                      <View style={[styles.providerInfo, isRTL && styles.rtlRow]}>
                        <Image source={{ uri: getApiUrl(service.executor?.profilePicture) }} style={styles.providerAvatar} />
                        <Text style={styles.providerName}>{service.executor?.name || 'منصة UIS'}</Text>
                      </View>
                      <View style={[styles.serviceFooter, isRTL && styles.rtlRow]}>
                        <View style={[styles.rating, isRTL && styles.rtlRow]}>
                          <Ionicons name="star" size={14} color="#f1c40f" />
                          <Text style={styles.ratingText}>{parseFloat(service.rating || '0').toFixed(1)}</Text>
                        </View>
                        <Text style={styles.price}>{service.basePrice} ر.س</Text>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  headerWrapper: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  header: { padding: 24, paddingTop: 60, paddingBottom: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rtlRow: { flexDirection: 'row-reverse' },
  greeting: { fontSize: 24, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 16, color: '#a0a0b0', marginTop: 4 },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 10, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff4d4d', borderWidth: 2, borderColor: '#1a1a2e' },
  content: { paddingBottom: 24, marginTop: 16 },
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { fontSize: 14, color: '#6c63ff', fontWeight: 'bold' },
  horizontalList: { gap: 16, flexDirection: 'row' },
  executorCard: { width: 110, backgroundColor: '#1a1a2e', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a4e' },
  executorAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 12 },
  executorName: { fontSize: 12, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  executorStats: { fontSize: 11, color: '#f1c40f', marginTop: 4, fontWeight: '600' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  serviceCardWrapper: { width: width / 2 - 32 },
  serviceCard: { backgroundColor: '#1a1a2e', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a4e' },
  serviceImage: { width: '100%', height: 120 },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, justifyContent: 'flex-end', padding: 8 },
  categoryTag: { color: '#fff', fontSize: 10, fontWeight: 'bold', backgroundColor: '#6c63ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  serviceContent: { padding: 12 },
  serviceTitle: { fontSize: 13, fontWeight: 'bold', color: '#fff', height: 36 },
  providerInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  providerAvatar: { width: 18, height: 18, borderRadius: 9 },
  providerName: { fontSize: 11, color: '#a0a0b0' },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2a2a4e' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  price: { fontSize: 13, fontWeight: 'bold', color: '#2ecc71' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
  emptyText: { fontSize: 15, color: '#6c6c90', fontWeight: '600' },
});

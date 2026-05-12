import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCategories, fetchServices } from '../../../store/slices/catalogSlice';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../services/api';
import SearchBar from '../../../components/SearchBar';
import CategoryList from '../../../components/CategoryList';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, services, loading } = useSelector((state: RootState) => state.catalog);
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchServices());
  }, [dispatch]);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    dispatch(fetchServices({ searchTerm: text, category: selectedCategoryId }));
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>مرحباً، {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'أحمد'} 👋</Text>
              <Text style={styles.subtitle}>ماذا تحتاج اليوم؟</Text>
            </View>
            <Pressable style={styles.notificationBtn} onPress={() => router.push('/Admin/Notifications' as any)}>
              <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              <View style={styles.badge} />
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <Pressable onPress={() => router.push('/student/search' as any)}>
        <View pointerEvents="none">
          <SearchBar onSearch={() => {}} value="" />
        </View>
      </Pressable>

      <View style={styles.content}>
        {/* Categories */}
        <CategoryList 
          categories={categories} 
          selectedCategoryId={selectedCategoryId} 
          onSelectCategory={handleSelectCategory} 
        />

        {/* Top Executors */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>منفذين متميزين</Text>
            <Pressable onPress={() => router.push({ pathname: '/student/search' as any, params: { tab: 'executors' } })}>
              <Text style={styles.seeAll}>الكل</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {/* We'll use a mocked list or fetch later, for now sample items */}
            {[1, 2].map((_, i) => (
              <Pressable key={i} style={styles.executorCard} onPress={() => router.push('/student/search?tab=executors' as any)}>
                <View style={styles.executorAvatarContainer}>
                   <Ionicons name="person-circle-outline" size={50} color={Colors.border} />
                </View>
                <Text style={styles.executorName}>اكتشف الخبراء</Text>
                <Text style={styles.executorStats}>تواصل الآن</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Popular Services */}
        <View style={[styles.section, { paddingBottom: 100, marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>خدمات مقترحة</Text>
          {loading && services.length === 0 ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : services.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>لم نجد خدمات تطابق بحثك</Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {services.map((service: any, index: number) => (
                <Animated.View key={service.id} entering={FadeInDown.delay(index * 50).springify()} style={styles.serviceCardWrapper}>
                  <Pressable style={styles.serviceCard} onPress={() => router.push(`/student/service/${service.id}`)}>
                    <Image source={{ uri: getApiUrl(service.imageUrl) }} style={styles.serviceImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.imageOverlay}
                    >
                      <Text style={styles.categoryTag}>{service.categoryName}</Text>
                    </LinearGradient>
                    <View style={styles.serviceContent}>
                      <Text style={styles.serviceTitle} numberOfLines={2}>{service.title}</Text>
                      
                      <View style={styles.providerInfo}>
                        <Image source={{ uri: getApiUrl(service.executor?.profilePicture) }} style={styles.providerAvatar} />
                        <Text style={styles.providerName}>{service.executor?.name || 'منصة UIS'}</Text>
                      </View>

                      <View style={styles.serviceFooter}>
                        <View style={styles.rating}>
                          <Ionicons name="star" size={16} color={Colors.warning} />
                          <Text style={styles.ratingText}>{parseFloat(service.rating || '5.0').toFixed(1)}</Text>
                        </View>
                        <Text style={styles.price}>{service.basePrice} ج.م</Text>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'right',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  horizontalList: {
    paddingLeft: 24,
    gap: 16,
    flexDirection: 'row-reverse',
  },
  executorCard: {
    width: 120,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  executorAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  executorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  executorStats: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 16,
  },
  serviceCardWrapper: {
    width: width / 2 - 32,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceImage: {
    width: '100%',
    height: 120,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 8,
  },
  categoryTag: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  serviceContent: {
    padding: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'right',
    height: 40,
  },
  providerInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  providerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  providerName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  serviceFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

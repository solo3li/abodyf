import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCategories, fetchServices } from '../../../store/slices/catalogSlice';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../services/api';

const { width } = Dimensions.get('window');

// Default icons/colors if backend doesn't provide them
const defaultIcons = ['school-outline', 'book-outline', 'color-palette-outline', 'language-outline', 'code-slash-outline'];
const defaultColors = ['#EFF6FF', '#FEF2F2', '#F0FDF4', '#FFFBEB', '#EEF2FF'];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, services, loading } = useSelector((state: RootState) => state.catalog);
  const { user } = useAuth();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchServices());
  }, [dispatch]);

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

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput as any} 
              placeholder="ابحث عن خدمات..."
              placeholderTextColor={Colors.textSecondary}
            />
            <Pressable style={styles.filterBtn}>
              <Ionicons name="options-outline" size={20} color={Colors.white} />
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>التصنيفات</Text>
            <Pressable onPress={() => router.push('/student/(tabs)/categories' as any)}>
              <Text style={styles.seeAll}>الكل</Text>
            </Pressable>
          </View>
          {loading && categories.length === 0 ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
              {categories.slice(0, 8).map((cat: any, index: number) => (
                <Animated.View key={cat.id} entering={FadeInDown.delay(index * 50).springify()}>
                  <Pressable style={styles.categoryCard} onPress={() => router.push(`/student/service/${cat.id}`)}>
                    <View style={[styles.iconContainer, { backgroundColor: defaultColors[index % defaultColors.length] }]}>
                      <Ionicons name={defaultIcons[index % defaultIcons.length] as any} size={28} color={Colors.primary} />
                    </View>
                    <Text style={styles.categoryTitle}>{cat.name}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Special Offer */}
        <View style={styles.section}>
          <LinearGradient
            colors={[Colors.accent, '#F43F5E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>خصم 20% لفترة محدودة!</Text>
              <Text style={styles.bannerSubtitle}>استخدم كود: UIS20</Text>
              <Pressable style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>اطلب الآن</Text>
              </Pressable>
            </View>
            <Ionicons name="gift" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
          </LinearGradient>
        </View>

        {/* Popular Services */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <Text style={styles.sectionTitle}>خدمات شائعة</Text>
          {loading && services.length === 0 ? (
            <ActivityIndicator color={Colors.primary} />
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
                        <Image source={{ uri: getApiUrl(service.providerAvatarUrl) }} style={styles.providerAvatar} />
                        <Text style={styles.providerName}>{service.providerName || 'منصة UIS'}</Text>
                      </View>

                      <View style={styles.serviceMeta}>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{service.deliveryTime || 'يومان'}</Text>
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
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    boxShadow: [{ color: 'rgba(28, 55, 120, 0.15)', offsetX: 0, offsetY: 10, blurRadius: 20, spreadDistance: 0 }],
    elevation: 10,
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 40,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
    boxShadow: [{ color: 'rgba(0, 0, 0, 0.05)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  filterBtn: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  content: {
    paddingTop: 24,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  categoriesList: {
    gap: 16,
  },
  categoryCard: {
    alignItems: 'center',
    width: 76,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  banner: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  bannerBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: Colors.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bannerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '-15deg' }],
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCardWrapper: {
    width: width / 2 - 32,
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: [{ color: 'rgba(0, 0, 0, 0.05)', offsetX: 0, offsetY: 4, blurRadius: 10, spreadDistance: 0 }],
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 140,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'flex-end',
    padding: 12,
  },
  categoryTag: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  serviceContent: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  providerName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
});

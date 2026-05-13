import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchFavorites, setSearchKeyword, toggleFavorite } from '../../../store/slices/favoritesSlice';
import { API_BASE_URL } from '../../../services/api';

const { width } = Dimensions.get('window');

export default function FavouritesScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, searchKeyword } = useSelector((state: RootState) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    if (!searchKeyword) return items;
    const lowerKeyword = searchKeyword.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerKeyword) || 
      item.description.toLowerCase().includes(lowerKeyword)
    );
  }, [items, searchKeyword]);

  const getApiUrl = (path: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600';
    return path.startsWith('http') ? path : API_BASE_URL + path;
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <Pressable style={styles.card} onPress={() => router.push(`/student/service/${item.id}`)}>
      <Image source={{ uri: getApiUrl(item.imageUrl) }} style={styles.image} />
      <Pressable 
        style={styles.unfavoriteBtn} 
        onPress={() => dispatch(toggleFavorite(item.id))}
      >
        <Ionicons name="heart" size={20} color={Colors.error} />
      </Pressable>
      <View style={styles.cardContent}>
        <Text style={styles.category}>{item.categoryName}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.footer}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.ratingText}>{parseFloat(item.rating || '5.0').toFixed(1)}</Text>
          </View>
          <Text style={styles.price}>{item.basePrice} ج.م</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-forward" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>المفضلة</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث في مفضلاتك..."
            value={searchKeyword}
            onChangeText={(text) => dispatch(setSearchKeyword(text))}
          />
        </View>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={80} color={Colors.border} />
          <Text style={styles.emptyText}>لا توجد نتائج مطابقة</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.white },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.text, textAlign: 'right' },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.background, 
    borderRadius: 12, 
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, marginLeft: 12, textAlign: 'right', fontSize: 16 },
  list: { padding: 12, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  card: { 
    backgroundColor: Colors.white, 
    borderRadius: 16, 
    width: width / 2 - 20, 
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    boxShadow: [{ color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blurRadius: 8, spreadDistance: 0 }],
  },
  image: { width: '100%', height: 120 },
  unfavoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cardContent: { padding: 12 },
  category: { fontSize: 10, color: Colors.primary, fontWeight: 'bold', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: 'bold', color: Colors.text, height: 40 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, marginLeft: 4, color: Colors.textSecondary },
  price: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 16, fontSize: 18, color: Colors.textSecondary, textAlign: 'center' },
});

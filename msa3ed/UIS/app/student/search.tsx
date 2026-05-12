import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '../../services/api';
import SearchBar from '../../components/SearchBar';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'services' | 'executors'>(params.tab as any || 'services');
  const [searchTerm, setSearchTerm] = useState(params.q as string || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'services' ? '/Services' : '/Executors';
      const data = await apiFetch(`${endpoint}?searchTerm=${encodeURIComponent(searchTerm)}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [activeTab, searchTerm]);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      style={styles.resultItem}
      onPress={() => router.push((activeTab === 'services' ? `/student/service/${item.id}` : `/student/profile/${item.id}`) as any)}
    >
      <Image 
        source={{ uri: item.imageUrl || item.profilePicture || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600' }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title || item.fullName}</Text>
        <Text style={styles.itemSub}>{item.categoryName || item.major || 'خبير أكاديمي'}</Text>
        <View style={styles.itemMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.ratingText}>{parseFloat(item.rating || '5.0').toFixed(1)}</Text>
          </View>
          {activeTab === 'executors' && (
            <Text style={styles.ordersText}>{item.completedOrders} طلب</Text>
          )}
          {activeTab === 'services' && (
            <Text style={styles.priceText}>{item.basePrice} ج.م</Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>البحث</Text>
      </View>

      <SearchBar onSearch={setSearchTerm} value={searchTerm} />

      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'services' && styles.activeTab]} 
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>الخدمات</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'executors' && styles.activeTab]} 
          onPress={() => setActiveTab('executors')}
        >
          <Text style={[styles.tabText, activeTab === 'executors' && styles.activeTabText]}>المنفذين</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>لم نجد نتائج تطابق بحثك</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row-reverse', alignItems: 'center', padding: 24, paddingTop: 60, gap: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  tabs: { flexDirection: 'row-reverse', marginHorizontal: 24, marginBottom: 16, backgroundColor: Colors.background, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: Colors.white, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  activeTabText: { color: Colors.primary },
  list: { padding: 24 },
  resultItem: { flexDirection: 'row-reverse', backgroundColor: Colors.white, borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, textAlign: 'right' },
  itemSub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right', marginTop: 2 },
  itemMeta: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rating: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
  ordersText: { fontSize: 12, color: Colors.textSecondary },
  priceText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  empty: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
});

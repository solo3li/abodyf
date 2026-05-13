import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator, I18nManager } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { searchServices, setFilter, removeFilter, clearAllFilters, setPage } from '../../store/slices/searchSlice';
import { apiFetch } from '../../services/api';
import SearchBar from '../../components/SearchBar';
import BottomSheet from '@gorhom/bottom-sheet';
import AdvancedFilterSheet from '../../components/AdvancedFilterSheet';
import FilterChipBar from '../../components/FilterChipBar';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../../components/EmptyState';

// Feature 013 T064: Advanced Search Screen with Redux state, FilterChipBar, and AdvancedFilterSheet

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const isRTL = I18nManager.isRTL;

  const [activeTab, setActiveTab] = useState<'services' | 'executors'>(params.tab as any || 'services');
  
  // Services use Redux
  const { filters, results, loading, totalCount, page } = useSelector((state: RootState) => state.search);
  
  // Executors use local state (simple search)
  const [executorSearch, setExecutorSearch] = useState('');
  const [executors, setExecutors] = useState<any[]>([]);
  const [loadingExecutors, setLoadingExecutors] = useState(false);

  const sheetRef = useRef<BottomSheet>(null);

  // Initial mount sync from params
  useEffect(() => {
    if (params.q) {
      if (activeTab === 'services') dispatch(setFilter({ keyword: params.q as string }));
      else setExecutorSearch(params.q as string);
    }
  }, [params.q]);

  // Trigger Services search
  useEffect(() => {
    if (activeTab === 'services') {
      dispatch(searchServices({ filters, page }));
    }
  }, [filters, page, activeTab, dispatch]);

  // Trigger Executors search
  useEffect(() => {
    if (activeTab === 'executors') {
      setLoadingExecutors(true);
      apiFetch(`/Admin/Executors?name=${encodeURIComponent(executorSearch)}`)
        .then(data => setExecutors(data.items || []))
        .catch(console.error)
        .finally(() => setLoadingExecutors(false));
    }
  }, [executorSearch, activeTab]);

  const handleApplyFilters = (newFilters: any) => {
    dispatch(setFilter(newFilters));
  };

  const handleLoadMore = () => {
    if (activeTab === 'services' && results.length < totalCount && !loading) {
      dispatch(setPage(page + 1));
    }
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <Pressable 
      style={[styles.resultItem, isRTL && styles.rtlRow]}
      onPress={() => router.push(`/student/service/${item.id}`)}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=600' }} 
        style={styles.itemImage} 
      />
      <View style={[styles.itemContent, isRTL && styles.rtlContent]}>
        <Text style={[styles.itemTitle, isRTL && styles.rtlText]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.itemSub, isRTL && styles.rtlText]}>{item.category?.name}</Text>
        <View style={[styles.itemMeta, isRTL && styles.rtlRow]}>
          <View style={[styles.rating, isRTL && styles.rtlRow]}>
            <Ionicons name="star" size={14} color="#f1c40f" />
            <Text style={styles.ratingText}>{parseFloat(item.rating || '0').toFixed(1)}</Text>
          </View>
          <Text style={styles.priceText}>{item.basePrice} ر.س</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderExecutorItem = ({ item }: { item: any }) => (
    <Pressable 
      style={[styles.resultItem, isRTL && styles.rtlRow]}
      onPress={() => router.push(`/student/profile/${item.id}`)}
    >
      <Image 
        source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} 
        style={styles.itemImage} 
      />
      <View style={[styles.itemContent, isRTL && styles.rtlContent]}>
        <Text style={[styles.itemTitle, isRTL && styles.rtlText]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemSub, isRTL && styles.rtlText]}>{item.specialty || 'خبير أكاديمي'}</Text>
        <View style={[styles.itemMeta, isRTL && styles.rtlRow]}>
          <View style={[styles.rating, isRTL && styles.rtlRow]}>
            <Ionicons name="star" size={14} color="#f1c40f" />
            <Text style={styles.ratingText}>{parseFloat(item.rating || '0').toFixed(1)}</Text>
          </View>
          <Text style={styles.ordersText}>{item.completedOrdersCount} طلب</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>البحث</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={[styles.searchRow, isRTL && styles.rtlRow]}>
        <View style={{ flex: 1 }}>
          <SearchBar 
            onSearch={(text) => activeTab === 'services' ? dispatch(setFilter({ keyword: text })) : setExecutorSearch(text)} 
            value={activeTab === 'services' ? filters.keyword : executorSearch} 
          />
        </View>
        {activeTab === 'services' && (
          <Pressable style={styles.filterBtn} onPress={() => sheetRef.current?.expand()}>
            <Ionicons name="options-outline" size={24} color="#fff" />
          </Pressable>
        )}
      </View>

      {activeTab === 'services' && (
        <FilterChipBar 
          filters={filters} 
          onRemoveFilter={(k) => dispatch(removeFilter(k))} 
          onClearAll={() => dispatch(clearAllFilters())} 
        />
      )}

      <View style={[styles.tabs, isRTL && styles.rtlRow]}>
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

      <View style={{ flex: 1 }}>
        {activeTab === 'services' ? (
          loading && page === 1 ? (
            <ActivityIndicator color="#6c63ff" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={results}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                <EmptyState icon="search-outline" title="لم نجد نتائج" description="جرب تغيير خيارات التصفية" />
              }
            />
          )
        ) : (
          loadingExecutors ? (
            <ActivityIndicator color="#6c63ff" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={executors}
              renderItem={renderExecutorItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <EmptyState icon="search-outline" title="لم نجد نتائج" description="جرب تغيير كلمة البحث" />
              }
            />
          )
        )}
      </View>

      <AdvancedFilterSheet 
        sheetRef={sheetRef} 
        initialFilters={filters}
        onApply={handleApplyFilters} 
        onClose={() => sheetRef.current?.close()} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: '#1a1a2e', borderBottomWidth: 1, borderBottomColor: '#2a2a4e' },
  rtlRow: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2a2a4e', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginVertical: 16, gap: 12 },
  filterBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#6c63ff', justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 8, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#6c63ff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6c6c90' },
  activeTabText: { color: '#fff' },
  list: { padding: 24, paddingBottom: 100 },
  resultItem: { flexDirection: 'row', backgroundColor: '#1a1a2e', borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a4e', alignItems: 'center', gap: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemContent: { flex: 1 },
  rtlContent: { alignItems: 'flex-end' },
  rtlText: { textAlign: 'right' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  itemSub: { fontSize: 12, color: '#6c6c90', marginTop: 2 },
  itemMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  ordersText: { fontSize: 12, color: '#6c6c90' },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#6c63ff' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Switch, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors } from '../constants/Colors';
import Button from './Button';
import { SearchFilter } from '../store/slices/searchSlice';
import { apiFetch } from '../services/api';

// Feature 013 T063: AdvancedFilterSheet with 7 dimensions
// Supports: category, subcategory, price, rating, availability, deliveryDays, sortBy

interface Props {
  sheetRef: React.RefObject<BottomSheet>;
  initialFilters: SearchFilter;
  onApply: (filters: Partial<SearchFilter>) => void;
  onClose: () => void;
}

export default function AdvancedFilterSheet({ sheetRef, initialFilters, onApply, onClose }: Props) {
  const [filters, setFilters] = useState<SearchFilter>(initialFilters);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/Categories').then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (filters.categoryId) {
      apiFetch(`/Categories/${filters.categoryId}/SubCategories`)
        .then(setSubCategories).catch(console.error);
    } else {
      setSubCategories([]);
    }
  }, [filters.categoryId]);

  useEffect(() => {
    // Sync when opened
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const empty: SearchFilter = { keyword: filters.keyword }; // Keep search keyword
    setFilters(empty);
    onApply(empty);
    onClose();
  };

  const updateFilter = (key: keyof SearchFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={['85%']}
      index={-1}
      enablePanDownToClose
      backgroundStyle={styles.bg}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>تصفية متقدمة</Text>
          <Pressable onPress={handleReset}>
            <Text style={styles.resetText}>إعادة ضبط</Text>
          </Pressable>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>التصنيف</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              style={[styles.chip, filters.categoryId === cat.id && styles.chipActive]}
              onPress={() => updateFilter('categoryId', filters.categoryId === cat.id ? undefined : cat.id)}
            >
              <Text style={[styles.chipText, filters.categoryId === cat.id && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* SubCategories (conditionally rendered) */}
        {subCategories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>التصنيف الفرعي</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {subCategories.map(sub => (
                <Pressable
                  key={sub.id}
                  style={[styles.chip, filters.subCategoryId === sub.id && styles.chipActive]}
                  onPress={() => updateFilter('subCategoryId', filters.subCategoryId === sub.id ? undefined : sub.id)}
                >
                  <Text style={[styles.chipText, filters.subCategoryId === sub.id && styles.chipTextActive]}>
                    {sub.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Price Range */}
        <Text style={styles.sectionTitle}>السعر (ر.س)</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="الحد الأقصى"
            placeholderTextColor="#6c6c90"
            value={filters.maxPrice?.toString() || ''}
            onChangeText={v => updateFilter('maxPrice', v ? parseFloat(v) : undefined)}
          />
          <Text style={{ color: '#fff' }}> - </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="الحد الأدنى"
            placeholderTextColor="#6c6c90"
            value={filters.minPrice?.toString() || ''}
            onChangeText={v => updateFilter('minPrice', v ? parseFloat(v) : undefined)}
          />
        </View>

        {/* Rating & Delivery Days */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>التقييم (حد أدنى)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="مثال: 4.5"
              placeholderTextColor="#6c6c90"
              value={filters.minRating?.toString() || ''}
              onChangeText={v => updateFilter('minRating', v ? parseFloat(v) : undefined)}
            />
          </View>
          <View style={{ width: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>توصيل خلال (أيام)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="أقصى مدة"
              placeholderTextColor="#6c6c90"
              value={filters.deliveryDays?.toString() || ''}
              onChangeText={v => updateFilter('deliveryDays', v ? parseInt(v) : undefined)}
            />
          </View>
        </View>

        {/* Sort By */}
        <Text style={styles.sectionTitle}>الترتيب حسب</Text>
        <View style={styles.sortGrid}>
          {[
            { id: 'rating', label: 'الأعلى تقييماً' },
            { id: 'newest', label: 'الأحدث' },
            { id: 'price_asc', label: 'الأقل سعراً' },
            { id: 'price_desc', label: 'الأعلى سعراً' },
          ].map(sort => (
            <Pressable
              key={sort.id}
              style={[styles.sortBtn, filters.sortBy === sort.id && styles.sortBtnActive]}
              onPress={() => updateFilter('sortBy', sort.id)}
            >
              <Text style={[styles.sortText, filters.sortBy === sort.id && styles.sortTextActive]}>
                {sort.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Availability Switch */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>المنفذ متاح الآن</Text>
          <Switch
            value={filters.availability === 'available_now'}
            onValueChange={v => updateFilter('availability', v ? 'available_now' : undefined)}
            trackColor={{ false: '#2a2a4e', true: '#6c63ff88' }}
            thumbColor={filters.availability === 'available_now' ? '#6c63ff' : '#6c6c90'}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Button title="تطبيق الفلاتر" onPress={handleApply} />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: '#1a1a2e' },
  indicator: { backgroundColor: '#2a2a4e' },
  content: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  resetText: { fontSize: 14, color: '#ff4d4d', fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#a0a0b0', marginBottom: 12, textAlign: 'right' },
  hScroll: { flexDirection: 'row-reverse', marginBottom: 24 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#0f0f1f', borderRadius: 20,
    borderWidth: 1, borderColor: '#2a2a4e', marginLeft: 8,
  },
  chipActive: { backgroundColor: '#6c63ff22', borderColor: '#6c63ff' },
  chipText: { color: '#6c6c90', fontSize: 14 },
  chipTextActive: { color: '#6c63ff', fontWeight: 'bold' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 24, gap: 8 },
  input: {
    flex: 1, backgroundColor: '#0f0f1f', borderWidth: 1, borderColor: '#2a2a4e',
    borderRadius: 12, padding: 12, textAlign: 'right', color: '#fff',
  },
  switchRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  switchLabel: { color: '#fff', fontSize: 15 },
  sortGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  sortBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#0f0f1f', borderRadius: 12,
    borderWidth: 1, borderColor: '#2a2a4e', flexBasis: '48%',
  },
  sortBtnActive: { backgroundColor: '#6c63ff22', borderColor: '#6c63ff' },
  sortText: { color: '#6c6c90', textAlign: 'center', fontSize: 13 },
  sortTextActive: { color: '#6c63ff', fontWeight: 'bold' },
});

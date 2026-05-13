import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, I18nManager
} from 'react-native';
import { SearchFilter } from '../store/slices/searchSlice';

// Feature 013 T059: FilterChipBar — dismissible chip badges for active filters — RTL-aware

type FilterKey = keyof SearchFilter;

const FILTER_LABELS: Record<string, (val: any) => string> = {
  keyword: (v) => `"${v}"`,
  categoryId: () => 'فئة',
  subCategoryId: () => 'فئة فرعية',
  minPrice: (v) => `الحد الأدنى: ${v} ر.س`,
  maxPrice: (v) => `الحد الأقصى: ${v} ر.س`,
  minRating: (v) => `تقييم ≥ ${v}`,
  availability: () => 'متاح الآن',
  deliveryDays: (v) => `توصيل ≤ ${v} أيام`,
  sortBy: (v) => ({
    rating: 'الأعلى تقييماً',
    price_asc: 'الأقل سعراً',
    price_desc: 'الأعلى سعراً',
    newest: 'الأحدث',
  }[v as string] ?? v),
};

interface Props {
  filters: SearchFilter;
  categoryName?: string;
  subCategoryName?: string;
  onRemoveFilter: (key: FilterKey) => void;
  onClearAll: () => void;
}

export const FilterChipBar: React.FC<Props> = ({
  filters, categoryName, subCategoryName, onRemoveFilter, onClearAll
}) => {
  const isRTL = I18nManager.isRTL;

  const activeFilters: { key: FilterKey; label: string }[] = [];

  const filterEntries: [FilterKey, any][] = Object.entries(filters) as [FilterKey, any][];
  filterEntries.forEach(([key, val]) => {
    if (val == null || val === '' || val === false) return;
    let label = '';
    if (key === 'categoryId') label = `فئة: ${categoryName ?? val}`;
    else if (key === 'subCategoryId') label = `فئة فرعية: ${subCategoryName ?? val}`;
    else label = FILTER_LABELS[key]?.(val) ?? String(val);
    activeFilters.push({ key, label });
  });

  if (activeFilters.length === 0) return null;

  return (
    <View style={[styles.container, isRTL && styles.rtlContainer]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, isRTL && styles.rtlScroll]}
      >
        {activeFilters.map(({ key, label }) => (
          <View key={key} style={styles.chip}>
            <Text style={styles.chipLabel} numberOfLines={1}>{label}</Text>
            <TouchableOpacity
              onPress={() => onRemoveFilter(key)}
              accessibilityLabel={`remove-filter-${key}`}
              style={styles.chipClose}
            >
              <Text style={styles.chipCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {activeFilters.length > 1 && (
          <TouchableOpacity
            style={styles.clearAll}
            onPress={onClearAll}
            accessibilityLabel="clear-all-filters"
          >
            <Text style={styles.clearAllText}>مسح الكل</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, paddingVertical: 8 },
  rtlContainer: { alignItems: 'flex-end' },
  scroll: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rtlScroll: { flexDirection: 'row-reverse' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#6c63ff22',
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#6c63ff55',
  },
  chipLabel: { color: '#9999dd', fontSize: 12, marginRight: 6 },
  chipClose: { padding: 2 },
  chipCloseText: { color: '#6c63ff', fontSize: 12, fontWeight: '700' },
  clearAll: {
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: '#ff4d4d22', borderRadius: 20,
    borderWidth: 1, borderColor: '#ff4d4d44',
  },
  clearAllText: { color: '#ff4d4d', fontSize: 12, fontWeight: '600' },
});

export default FilterChipBar;

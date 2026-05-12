import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface CategoryListProps {
  categories: any[];
  selectedCategoryId?: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryList({ categories, selectedCategoryId, onSelectCategory }: CategoryListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>التصنيفات</Text>
      {categories.map((item) => (
        <Pressable
          key={item.id}
          style={[
            styles.categoryItem,
            selectedCategoryId === item.id && styles.selectedCategory
          ]}
          onPress={() => onSelectCategory(item.id)}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name="briefcase-outline" 
              size={20} 
              color={selectedCategoryId === item.id ? Colors.white : Colors.primary} 
            />
          </View>
          <Text style={[
            styles.categoryName,
            selectedCategoryId === item.id && styles.selectedCategoryText
          ]}>
            {item.name}
          </Text>
          <Ionicons 
            name="chevron-back" 
            size={16} 
            color={selectedCategoryId === item.id ? Colors.white : Colors.textSecondary} 
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingVertical: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16, textAlign: 'right' },
  categoryItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  selectedCategoryText: {
    color: Colors.white,
  },
});
